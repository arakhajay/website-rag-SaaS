import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// CORS headers for widget cross-origin requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle preflight requests
export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders })
}

// Create a new lead
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { chatbotId, email, phone, message, source = 'widget' } = body

        if (!chatbotId || !email) {
            return NextResponse.json(
                { error: 'Chatbot ID and email are required' },
                { status: 400, headers: corsHeaders }
            )
        }

        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('leads')
            .insert({
                chatbot_id: chatbotId,
                email,
                phone,
                message: message?.slice(0, 2000), // Max 2000 chars
                source,
            })
            .select('id')
            .single()

        if (error) {
            console.error('[Leads API] Insert error:', error)
            return NextResponse.json(
                { error: 'Failed to save lead' },
                { status: 500, headers: corsHeaders }
            )
        }

        return NextResponse.json(
            { success: true, id: data.id },
            { status: 201, headers: corsHeaders }
        )
    } catch (e: any) {
        console.error('[Leads API] Error:', e)
        return NextResponse.json(
            { error: e.message },
            { status: 500, headers: corsHeaders }
        )
    }
}
