'use server'

import { verifyAdminOrThrow } from '@/lib/admin/verify-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { unstable_noStore as noStore } from 'next/cache'

// ============================================
// GLOBAL STATS
// ============================================

export interface GlobalStats {
    totalUsers: number
    activeUsers: number
    bannedUsers: number
    totalChatbots: number
    totalMessages: number
    estimatedTokens: number
    estimatedCost: number
    totalLeads: number
}

export async function getGlobalStats(): Promise<GlobalStats> {
    noStore()
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    // Total users
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    // Active users (status = 'active' or no status field yet)
    const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .or('status.is.null,status.eq.active')

    // Banned users
    const { count: bannedUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'banned')

    // Total chatbots
    const { count: totalChatbots } = await supabase
        .from('chatbots')
        .select('*', { count: 'exact', head: true })

    // Total messages (all time)
    const { count: totalMessages } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })

    // Total leads
    const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

    // Estimate tokens and cost
    // Average ~4 chars per token, ~750 tokens per message pair (input + output)
    const estimatedTokens = (totalMessages || 0) * 750
    // GPT-4o pricing: ~$5 per 1M input tokens, ~$15 per 1M output tokens
    // Simplified: ~$10 per 1M tokens average
    const estimatedCost = (estimatedTokens / 1000000) * 10

    return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        bannedUsers: bannedUsers || 0,
        totalChatbots: totalChatbots || 0,
        totalMessages: totalMessages || 0,
        estimatedTokens,
        estimatedCost: Math.round(estimatedCost * 100) / 100,
        totalLeads: totalLeads || 0,
    }
}

// ============================================
// RECENT SIGNUPS
// ============================================

export interface RecentSignup {
    id: string
    email: string
    created_at: string
    billing_status: string
}

export async function getRecentSignups(limit: number = 5): Promise<RecentSignup[]> {
    noStore()
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, created_at, billing_status')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent signups:', error)
        return []
    }

    return data || []
}

// ============================================
// ALL USERS (with aggregated stats)
// ============================================

export interface AdminUser {
    id: string
    email: string
    full_name: string | null
    created_at: string
    billing_status: string
    message_credits: number
    training_char_limit: number
    status: string
    role: string
    chatbots_count: number
}

export async function adminGetAllUsers(
    search?: string,
    page: number = 1,
    perPage: number = 20
): Promise<{ users: AdminUser[]; total: number }> {
    noStore()
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    // Get users with pagination
    let query = supabase
        .from('profiles')
        .select('id, email, full_name, created_at, billing_status, message_credits, training_char_limit, status, role', { count: 'exact' })

    if (search) {
        query = query.ilike('email', `%${search}%`)
    }

    const { data: users, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1)

    if (error) {
        console.error('Error fetching users:', error)
        return { users: [], total: 0 }
    }

    // Get chatbot counts for each user
    const userIds = users?.map(u => u.id) || []
    const { data: chatbotCounts } = await supabase
        .from('chatbots')
        .select('user_id')
        .in('user_id', userIds)

    // Aggregate chatbot counts
    const countMap: Record<string, number> = {}
    chatbotCounts?.forEach(c => {
        countMap[c.user_id] = (countMap[c.user_id] || 0) + 1
    })

    const usersWithCounts: AdminUser[] = (users || []).map(u => ({
        ...u,
        message_credits: u.message_credits || 10000,
        training_char_limit: u.training_char_limit || 400000,
        status: u.status || 'active',
        role: u.role || 'user',
        chatbots_count: countMap[u.id] || 0,
    }))

    return { users: usersWithCounts, total: count || 0 }
}

// ============================================
// UPDATE USER CREDITS
// ============================================

export async function adminUpdateUserCredits(
    userId: string,
    amount: number,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    // Get current credits
    const { data: user, error: fetchError } = await supabase
        .from('profiles')
        .select('message_credits, email')
        .eq('id', userId)
        .single()

    if (fetchError || !user) {
        return { success: false, error: 'User not found' }
    }

    const currentCredits = user.message_credits || 10000
    const newCredits = Math.max(0, currentCredits + amount)

    // Update credits
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ message_credits: newCredits })
        .eq('id', userId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // Log the action
    const { userId: adminId } = await verifyAdminOrThrow()
    await supabase.from('admin_audit_log').insert({
        admin_id: adminId,
        action: 'update_credits',
        target_user_id: userId,
        details: {
            previous_credits: currentCredits,
            new_credits: newCredits,
            amount,
            reason,
        },
    })

    return { success: true }
}

// ============================================
// BAN/UNBAN USER
// ============================================

export async function adminBanUser(
    userId: string,
    banned: boolean
): Promise<{ success: boolean; error?: string }> {
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    const status = banned ? 'banned' : 'active'

    const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)

    if (error) {
        return { success: false, error: error.message }
    }

    // Log the action
    const { userId: adminId } = await verifyAdminOrThrow()
    await supabase.from('admin_audit_log').insert({
        admin_id: adminId,
        action: banned ? 'ban_user' : 'unban_user',
        target_user_id: userId,
        details: { new_status: status },
    })

    return { success: true }
}

// ============================================
// CHANGE USER PLAN
// ============================================

export async function adminChangeUserPlan(
    userId: string,
    plan: 'free' | 'pro' | 'enterprise'
): Promise<{ success: boolean; error?: string }> {
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    // Define plan limits
    const planLimits = {
        free: { message_credits: 10000, training_char_limit: 400000 },
        pro: { message_credits: 100000, training_char_limit: 4000000 },
        enterprise: { message_credits: 1000000, training_char_limit: 40000000 },
    }

    const limits = planLimits[plan]

    const { error } = await supabase
        .from('profiles')
        .update({
            billing_status: plan,
            message_credits: limits.message_credits,
            training_char_limit: limits.training_char_limit,
        })
        .eq('id', userId)

    if (error) {
        return { success: false, error: error.message }
    }

    // Log the action
    const { userId: adminId } = await verifyAdminOrThrow()
    await supabase.from('admin_audit_log').insert({
        admin_id: adminId,
        action: 'change_plan',
        target_user_id: userId,
        details: { new_plan: plan, ...limits },
    })

    return { success: true }
}

// ============================================
// GET ALL CHATBOTS (for admin view)
// ============================================

export interface AdminChatbot {
    id: string
    name: string
    base_url: string
    created_at: string
    user_id: string
    owner_email: string
    sources_count: number
    messages_count: number
}

export async function adminGetAllChatbots(
    search?: string,
    page: number = 1,
    perPage: number = 20
): Promise<{ chatbots: AdminChatbot[]; total: number }> {
    noStore()
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    // Get chatbots with owner info
    let query = supabase
        .from('chatbots')
        .select(`
            id, name, base_url, created_at, user_id,
            profiles!inner(email)
        `, { count: 'exact' })

    if (search) {
        query = query.or(`name.ilike.%${search}%,base_url.ilike.%${search}%`)
    }

    const { data: chatbots, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1)

    if (error) {
        console.error('Error fetching chatbots:', error)
        return { chatbots: [], total: 0 }
    }

    // Get source and message counts
    const chatbotIds = chatbots?.map(c => c.id) || []

    const { data: sourceCounts } = await supabase
        .from('training_sources')
        .select('chatbot_id')
        .in('chatbot_id', chatbotIds)

    const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('id, chatbot_id')
        .in('chatbot_id', chatbotIds)

    const sessionIds = sessions?.map(s => s.id) || []
    const { data: messageCounts } = await supabase
        .from('chat_messages')
        .select('session_id')
        .in('session_id', sessionIds)

    // Aggregate counts
    const sourceCountMap: Record<string, number> = {}
    sourceCounts?.forEach(s => {
        sourceCountMap[s.chatbot_id] = (sourceCountMap[s.chatbot_id] || 0) + 1
    })

    const sessionChatbotMap: Record<string, string> = {}
    sessions?.forEach(s => {
        sessionChatbotMap[s.id] = s.chatbot_id
    })

    const messageCountMap: Record<string, number> = {}
    messageCounts?.forEach(m => {
        const chatbotId = sessionChatbotMap[m.session_id]
        if (chatbotId) {
            messageCountMap[chatbotId] = (messageCountMap[chatbotId] || 0) + 1
        }
    })

    const chatbotsWithCounts: AdminChatbot[] = (chatbots || []).map(c => ({
        id: c.id,
        name: c.name,
        base_url: c.base_url,
        created_at: c.created_at,
        user_id: c.user_id,
        owner_email: (c.profiles as any)?.email || 'Unknown',
        sources_count: sourceCountMap[c.id] || 0,
        messages_count: messageCountMap[c.id] || 0,
    }))

    return { chatbots: chatbotsWithCounts, total: count || 0 }
}

// ============================================
// SYSTEM HEALTH STATS
// ============================================

export interface SystemHealth {
    totalSessions: number
    messagesLast24h: number
    leadsLast24h: number
    errorRate: number // Placeholder
    avgResponseTime: number // Placeholder
}

export async function getSystemHealth(): Promise<SystemHealth> {
    noStore()
    await verifyAdminOrThrow()
    const supabase = createAdminClient()

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const { count: totalSessions } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })

    const { count: messagesLast24h } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())

    const { count: leadsLast24h } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString())

    return {
        totalSessions: totalSessions || 0,
        messagesLast24h: messagesLast24h || 0,
        leadsLast24h: leadsLast24h || 0,
        errorRate: 0.02, // Placeholder - would need error logging table
        avgResponseTime: 1.2, // Placeholder - would need timing data
    }
}
