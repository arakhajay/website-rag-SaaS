'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminOrThrow } from '@/lib/admin/verify-admin'

// ============================================
// REVENUE ANALYTICS
// ============================================

export interface RevenueStats {
    mrr: number // Monthly Recurring Revenue in cents
    arr: number // Annual Recurring Revenue in cents
    arpu: number // Average Revenue Per User in cents
    activeSubscriptions: number
    churnRate: number // Percentage
    planDistribution: {
        free: number
        pro: number
        enterprise: number
    }
}

export async function getRevenueStats(): Promise<RevenueStats> {
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    // Get all subscriptions
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('plan, status, amount_cents, cancelled_at, started_at')

    if (!subscriptions) {
        return {
            mrr: 0,
            arr: 0,
            arpu: 0,
            activeSubscriptions: 0,
            churnRate: 0,
            planDistribution: { free: 0, pro: 0, enterprise: 0 }
        }
    }

    // Calculate MRR (sum of active monthly amounts)
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
    const mrr = activeSubscriptions.reduce((sum, s) => sum + (s.amount_cents || 0), 0)
    const arr = mrr * 12

    // ARPU
    const payingUsers = activeSubscriptions.filter(s => s.amount_cents > 0).length
    const arpu = payingUsers > 0 ? Math.round(mrr / payingUsers) : 0

    // Plan distribution
    const planDistribution = {
        free: subscriptions.filter(s => s.plan === 'free').length,
        pro: subscriptions.filter(s => s.plan === 'pro').length,
        enterprise: subscriptions.filter(s => s.plan === 'enterprise').length
    }

    // Churn rate (cancelled in last 30 days / total at start of period)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const cancelledRecently = subscriptions.filter(s =>
        s.cancelled_at && new Date(s.cancelled_at) > thirtyDaysAgo
    ).length

    const totalAtPeriodStart = subscriptions.filter(s =>
        new Date(s.started_at) <= thirtyDaysAgo
    ).length

    const churnRate = totalAtPeriodStart > 0
        ? Math.round((cancelledRecently / totalAtPeriodStart) * 10000) / 100
        : 0

    return {
        mrr,
        arr,
        arpu,
        activeSubscriptions: activeSubscriptions.length,
        churnRate,
        planDistribution
    }
}

export interface MonthlyRevenue {
    month: string // 'Jan', 'Feb', etc.
    year: number
    revenue: number // in cents
    subscriptions: number
}

export async function getRevenueTrend(): Promise<MonthlyRevenue[]> {
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    // Get subscription history for last 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('amount_cents, status, started_at, cancelled_at')
        .gte('started_at', twelveMonthsAgo.toISOString())

    // Generate last 12 months
    const months: MonthlyRevenue[] = []
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)

        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        // Count active subscriptions in this month
        const activeInMonth = (subscriptions || []).filter(s => {
            const startedAt = new Date(s.started_at)
            const cancelledAt = s.cancelled_at ? new Date(s.cancelled_at) : null

            // Was active during this month
            return startedAt <= monthEnd &&
                (cancelledAt === null || cancelledAt >= monthStart)
        })

        const revenue = activeInMonth.reduce((sum, s) => sum + (s.amount_cents || 0), 0)

        months.push({
            month: monthNames[date.getMonth()],
            year: date.getFullYear(),
            revenue,
            subscriptions: activeInMonth.length
        })
    }

    return months
}

// ============================================
// AUDIT LOGGING
// ============================================

type AuditAction =
    | 'update_credits'
    | 'ban_user'
    | 'unban_user'
    | 'change_plan'
    | 'delete_chatbot'
    | 'create_announcement'
    | 'update_announcement'
    | 'delete_announcement'
    | 'toggle_feature_flag'
    | 'view_as_user'
    | 'export_users'

export async function logAdminAction(
    action: AuditAction,
    targetType: 'user' | 'chatbot' | 'subscription' | 'announcement' | 'feature_flag' | 'system',
    targetId?: string,
    targetEmail?: string,
    details?: Record<string, unknown>
) {
    const supabase = createAdminClient()

    // Get current admin
    const { data: { user } } = await (await import('@/lib/supabase/server')).createClient().then(c => c.auth.getUser())

    if (!user) return

    const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

    await supabase.from('admin_audit_log').insert({
        admin_id: user.id,
        admin_email: profile?.email,
        action,
        target_type: targetType,
        target_id: targetId,
        target_email: targetEmail,
        details: details || {}
    })
}

export interface AuditLogEntry {
    id: string
    admin_email: string
    action: string
    target_type: string
    target_email: string | null
    details: Record<string, unknown>
    created_at: string
}

export async function getAuditLog(limit = 50): Promise<AuditLogEntry[]> {
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    const { data } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    return (data || []) as AuditLogEntry[]
}

// ============================================
// USER EXPORT
// ============================================

export interface ExportUser {
    id: string
    email: string
    full_name: string | null
    role: string
    plan: string
    status: string
    message_credits: number
    created_at: string
    chatbot_count: number
}

export async function exportUsersCSV(): Promise<string> {
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    // Get all users with their subscriptions
    const { data: users } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            full_name,
            role,
            status,
            message_credits,
            created_at
        `)
        .order('created_at', { ascending: false })

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id, plan')

    const { data: chatbots } = await supabase
        .from('chatbots')
        .select('user_id')

    if (!users) return ''

    // Build export data
    const exportData: ExportUser[] = users.map(user => {
        const sub = subscriptions?.find(s => s.user_id === user.id)
        const botCount = chatbots?.filter(c => c.user_id === user.id).length || 0

        return {
            id: user.id,
            email: user.email || '',
            full_name: user.full_name,
            role: user.role || 'user',
            plan: sub?.plan || 'free',
            status: user.status || 'active',
            message_credits: user.message_credits || 0,
            created_at: user.created_at,
            chatbot_count: botCount
        }
    })

    // Log the export action
    await logAdminAction('export_users', 'system', undefined, undefined, { count: exportData.length })

    // Generate CSV
    const headers = ['ID', 'Email', 'Name', 'Role', 'Plan', 'Status', 'Credits', 'Created At', 'Chatbots']
    const rows = exportData.map(u => [
        u.id,
        u.email,
        u.full_name || '',
        u.role,
        u.plan,
        u.status,
        u.message_credits,
        u.created_at,
        u.chatbot_count
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    return csv
}
