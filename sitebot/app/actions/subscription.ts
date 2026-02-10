'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDodoClient, PLANS, getPlanBySlug } from '@/lib/dodo'

export async function getSubscription() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { subscription: null, error: 'Not authenticated' }
    }

    const adminClient = createAdminClient()
    const { data: subscription, error } = await adminClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'on_hold', 'pending'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('[Subscription] Error fetching:', error)
        return { subscription: null, error: error.message }
    }

    return { subscription, error: null }
}

export async function createCheckoutSession(planSlug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { url: null, error: 'Not authenticated' }
    }

    const plan = getPlanBySlug(planSlug)
    if (!plan) {
        return { url: null, error: 'Invalid plan' }
    }

    try {
        const dodo = getDodoClient()

        // Check for existing Dodo customer ID
        const adminClient = createAdminClient()
        const { data: existingSub } = await adminClient
            .from('subscriptions')
            .select('dodo_customer_id')
            .eq('user_id', user.id)
            .maybeSingle()

        const dodoCustomerId = existingSub?.dodo_customer_id

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

        const customerPayload: any = {
            email: user.email || '',
            name: user.user_metadata?.full_name || user.email || '',
        }
        if (dodoCustomerId) {
            customerPayload.customer_id = dodoCustomerId
        }

        const subscription = await dodo.subscriptions.create({
            billing: { country: 'US' },
            customer: customerPayload,
            product_id: plan.productId,
            quantity: 1,
            payment_link: true,
            return_url: `${appUrl}/dashboard/pricing/success?plan=${planSlug}`,
            metadata: {
                user_id: user.id,
                plan_slug: planSlug,
                plan_name: plan.name,
            },
        })

        // Create a pending subscription record
        const { error: upsertError } = await adminClient
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                dodo_product_id: plan.productId,
                plan_name: planSlug,
                status: 'pending',
                dodo_customer_id: subscription.customer.customer_id,
                dodo_subscription_id: subscription.subscription_id,
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })

        if (upsertError) {
            console.error('[Subscription] DB Error:', upsertError)
            // We should arguably cancel the Dodo payment link if DB fails, but for now just fail.
            // Or proceed but warn? No, better fail early.
            throw new Error(`Failed to save subscription: ${upsertError.message}`)
        }

        return { url: subscription.payment_link, error: null }
    } catch (err: any) {
        console.error('[Subscription] Checkout error:', err)
        return { url: null, error: err.message || 'Failed to create checkout session' }
    }
}

export async function cancelSubscription() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const adminClient = createAdminClient()

    const { data: subscription } = await adminClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'on_hold'])
        .single()

    if (!subscription) {
        return { success: false, error: 'No active subscription found' }
    }

    // Update local status
    await adminClient
        .from('subscriptions')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id)

    return { success: true }
}

export async function getSubscriptionWithPlan() {
    const { subscription, error } = await getSubscription()

    if (!subscription) {
        return { subscription: null, plan: null, error }
    }

    const plan = PLANS[subscription.plan_name] || null

    return {
        subscription,
        plan,
        error: null,
    }
}
