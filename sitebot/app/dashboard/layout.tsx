import { Sidebar } from '@/components/dashboard/sidebar'
import { getSubscriptionWithPlan } from '@/app/actions/subscription'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    let user = null
    try {
        const authResult = await Promise.race([
            supabase.auth.getUser(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 5000))
        ]) as { data: { user: any } }
        user = authResult.data.user
    } catch (e) {
        console.error('Dashboard auth check failed:', e)
    }

    if (!user) {
        redirect('/login')
    }

    // Check subscription status
    let subscription = null
    let plan = null
    try {
        const result = await Promise.race([
            getSubscriptionWithPlan(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Subscription timeout')), 5000))
        ]) as { subscription: any, plan: any }
        subscription = result.subscription
        plan = result.plan
    } catch (e) {
        console.error('Subscription check failed:', e)
    }

    // Allow access to pricing pages without subscription
    // The actual path check happens at render time via headers
    const isSubscribed = subscription && ['active', 'on_hold', 'pending'].includes(subscription.status)

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar
                subscriptionPlan={plan?.name || null}
                subscriptionStatus={subscription?.status || null}
                isSubscribed={!!isSubscribed}
            />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6 md:p-10 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
