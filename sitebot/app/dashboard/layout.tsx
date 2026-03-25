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

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch username from profiles
    let username: string | null = null
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single()
        username = profile?.username || user.user_metadata?.username || null
    } catch {
        // fallback
    }

    // Check subscription status with timeout protection
    let subscription = null
    let plan = null
    try {
        const timeoutPromise = new Promise<never>((_, reject) =>
            // Increased to 10000ms to allow for Supabase cold starts on local dev
            setTimeout(() => reject(new Error('Subscription timeout')), 10000)
        )
        const result = await Promise.race([
            getSubscriptionWithPlan(),
            timeoutPromise,
        ])
        subscription = result?.subscription ?? null
        plan = result?.plan ?? null
    } catch (e) {
        console.error('[Dashboard Layout] Subscription check failed:', e instanceof Error ? e.message : e)
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
                username={username}
            />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6 md:p-10 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
