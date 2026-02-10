import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanByProductId } from '@/lib/dodo'
import crypto from 'crypto'

export async function POST(request: Request) {
    try {
        const body = await request.text()
        const signature = request.headers.get('webhook-signature')

        // Verify webhook signature if secret is configured
        const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET
        if (webhookSecret && signature) {
            const expectedSig = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex')

            if (signature !== expectedSig) {
                console.error('[Webhook] Invalid signature')
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
            }
        }

        const event = JSON.parse(body)
        console.log('[Webhook] Received event:', event.type || event.event_type)

        const eventType = event.type || event.event_type
        const data = event.data || event

        const adminClient = createAdminClient()

        switch (eventType) {
            case 'subscription.active': {
                const userId = data.metadata?.user_id
                const planSlug = data.metadata?.plan_slug
                const productId = data.product_id
                const subscriptionId = data.subscription_id
                const customerId = data.customer?.customer_id || data.customer_id

                if (!userId) {
                    console.error('[Webhook] No user_id in metadata')
                    break
                }

                const plan = getPlanByProductId(productId) || { name: planSlug || 'unknown' }

                await adminClient
                    .from('subscriptions')
                    .upsert({
                        user_id: userId,
                        dodo_subscription_id: subscriptionId,
                        dodo_customer_id: customerId,
                        dodo_product_id: productId,
                        plan_name: planSlug || (plan as any).slug || 'unknown',
                        status: 'active',
                        trial_ends_at: data.trial_end ? new Date(data.trial_end).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        current_period_start: data.current_period_start ? new Date(data.current_period_start).toISOString() : new Date().toISOString(),
                        current_period_end: data.current_period_end ? new Date(data.current_period_end).toISOString() : null,
                        updated_at: new Date().toISOString(),
                        usage_messages: 0, // Reset usage on activation/renewal
                    }, { onConflict: 'user_id' })

                console.log(`[Webhook] Subscription activated (usage reset) for user ${userId}, plan: ${planSlug}`)
                break
            }

            case 'subscription.renewed': {
                const subId = data.subscription_id
                if (subId) {
                    await adminClient
                        .from('subscriptions')
                        .update({
                            status: 'active',
                            current_period_start: data.current_period_start ? new Date(data.current_period_start).toISOString() : new Date().toISOString(),
                            current_period_end: data.current_period_end ? new Date(data.current_period_end).toISOString() : null,
                            updated_at: new Date().toISOString(),
                            usage_messages: 0, // Reset usage on renewal
                        })
                        .eq('dodo_subscription_id', subId)

                    console.log(`[Webhook] Subscription renewed & usage reset: ${subId}`)
                }
                break
            }

            case 'subscription.cancelled': {
                const subId = data.subscription_id
                if (subId) {
                    await adminClient
                        .from('subscriptions')
                        .update({
                            status: 'cancelled',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('dodo_subscription_id', subId)

                    console.log(`[Webhook] Subscription cancelled: ${subId}`)
                }
                break
            }

            case 'subscription.failed': {
                const subId = data.subscription_id
                if (subId) {
                    await adminClient
                        .from('subscriptions')
                        .update({
                            status: 'failed',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('dodo_subscription_id', subId)

                    console.log(`[Webhook] Subscription failed: ${subId}`)
                }
                break
            }

            case 'subscription.expired': {
                const subId = data.subscription_id
                if (subId) {
                    await adminClient
                        .from('subscriptions')
                        .update({
                            status: 'expired',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('dodo_subscription_id', subId)

                    console.log(`[Webhook] Subscription expired: ${subId}`)
                }
                break
            }

            case 'subscription.on_hold': {
                const subId = data.subscription_id
                if (subId) {
                    await adminClient
                        .from('subscriptions')
                        .update({
                            status: 'on_hold',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('dodo_subscription_id', subId)

                    console.log(`[Webhook] Subscription on hold: ${subId}`)
                }
                break
            }

            case 'payment.succeeded': {
                console.log(`[Webhook] Payment succeeded: ${data.payment_id}`)
                // If this is the first payment for a subscription, activate it
                const userId = data.metadata?.user_id
                const planSlug = data.metadata?.plan_slug
                if (userId && planSlug) {
                    const { data: existingSub } = await adminClient
                        .from('subscriptions')
                        .select('*')
                        .eq('user_id', userId)
                        .eq('status', 'pending')
                        .single()

                    if (existingSub) {
                        await adminClient
                            .from('subscriptions')
                            .update({
                                status: 'active',
                                dodo_subscription_id: data.subscription_id || data.payment_id,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', existingSub.id)

                        console.log(`[Webhook] Activated pending subscription for user ${userId}`)
                    }
                }
                break
            }

            default:
                console.log(`[Webhook] Unhandled event type: ${eventType}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('[Webhook] Error processing:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
