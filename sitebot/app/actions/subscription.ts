'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDodoClient, PLANS, getPlanBySlug, BillingInterval } from '@/lib/dodo'

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

export async function createCheckoutSession(planSlug: string, billingInterval: BillingInterval = 'monthly') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { url: null, error: 'Not authenticated' }
    }

    const plan = getPlanBySlug(planSlug)
    if (!plan) {
        return { url: null, error: 'Invalid plan' }
    }

    const productId = billingInterval === 'yearly' ? plan.yearlyProductId : plan.productId

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

        const createSubscriptionPayload = (customerId?: string) => {
            const customerPayload: any = {
                email: user.email || '',
                name: user.user_metadata?.full_name || user.email || '',
            }
            if (customerId) {
                customerPayload.customer_id = customerId
            }
            return {
                billing: { country: 'US' as const },
                customer: customerPayload,
                product_id: productId,
                quantity: 1,
                payment_link: true as const,
                return_url: `${appUrl}/dashboard/pricing/success?plan=${planSlug}&billing=${billingInterval}`,
                metadata: {
                    user_id: user.id,
                    plan_slug: planSlug,
                    billing_interval: billingInterval,
                },
                trial_period_days: 7,
            }
        }

        let subscription
        try {
            // Try with existing customer ID first
            const payload = createSubscriptionPayload(dodoCustomerId || undefined)
            console.log('[Subscription] Product ID being used:', productId)
            console.log('[Subscription] Plan slug:', planSlug, '| Billing:', billingInterval)
            console.log('[Subscription] Customer ID:', dodoCustomerId || 'none')
            console.log('[Subscription] Full payload:', JSON.stringify(payload, null, 2))
            subscription = await dodo.subscriptions.create(payload)
        } catch (firstErr: any) {
            console.error('[Subscription] First attempt failed:', {
                message: firstErr.message,
                status: firstErr.status,
                statusCode: firstErr.statusCode,
                body: firstErr.body,
                error: firstErr.error,
            })
            if (dodoCustomerId) {
                // Stale customer ID (e.g. from test mode) — retry without it
                console.warn('[Subscription] Retrying without customer_id (was:', dodoCustomerId, ')')
                try {
                    const retryPayload = createSubscriptionPayload()
                    console.log('[Subscription] Retry payload:', JSON.stringify(retryPayload, null, 2))
                    subscription = await dodo.subscriptions.create(retryPayload)
                    // Clear stale customer_id from DB
                    await adminClient
                        .from('subscriptions')
                        .update({ dodo_customer_id: null })
                        .eq('user_id', user.id)
                    console.log('[Subscription] Cleared stale customer_id from DB')
                } catch (retryErr: any) {
                    console.error('[Subscription] Retry also failed:', retryErr.message)
                    throw retryErr
                }
            } else {
                throw firstErr
            }
        }

        // Create a pending subscription record
        const { error: upsertError } = await adminClient
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                dodo_product_id: productId,
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

export async function cancelSubscription(feedback?: string) {
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
        .in('status', ['active', 'on_hold', 'pending'])
        .single()

    if (!subscription) {
        return { success: false, error: 'No active subscription found' }
    }

    try {
        // 1. Save feedback if provided
        if (feedback) {
            await adminClient
                .from('feedback')
                .insert({
                    user_id: user.id,
                    category: 'cancellation',
                    message: feedback,
                })
        }

        const now = new Date()
        const trialEndsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null
        const isTrialing = (trialEndsAt && trialEndsAt > now) || subscription.status === 'pending'

        // 2. Cancel in Dodo Payments (only if we have an ID)
        if (subscription.dodo_subscription_id) {
            const dodo = getDodoClient()
            try {
                if (isTrialing) {
                     await dodo.subscriptions.update(subscription.dodo_subscription_id, {
                        status: 'cancelled'
                    })
                } else {
                    await dodo.subscriptions.update(subscription.dodo_subscription_id, {
                        cancel_at_next_billing_date: true
                    })
                }
            } catch (dodoError: any) {
                console.error('[Subscription] Dodo cancel error:', dodoError)
                // Continue to local cancel even if Dodo fails (e.g. if ID is invalid)
            }
        }

        // 3. Update local status
        const updatePayload: any = {
            status: 'cancelled',
            updated_at: new Date().toISOString(),
            // cancel_at_period_end: true // Column missing in DB, commenting out for now
        }

        if (isTrialing) {
            updatePayload.trial_ends_at = new Date().toISOString() // Expire trial immediately
            updatePayload.current_period_end = new Date().toISOString() // Expire access
        }

        const { data: updatedSub, error: updateError } = await adminClient
            .from('subscriptions')
            .update(updatePayload)
            .eq('id', subscription.id)
            .select('*')
            .single()

        if (updateError) {
             throw new Error(updateError.message)
        }

        return { success: true, subscription: updatedSub }
    } catch (error: any) {
        console.error('[Subscription] Cancel error:', error)
        return { success: false, error: error.message || 'Failed to cancel subscription' }
    }
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
