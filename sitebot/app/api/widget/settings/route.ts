
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// We need a supabase client that can read public settings
// Since we have RLS policies "Enable read access for all users", we can use specific client or even anon if key allows
// But securely, we should probably just use the service role here to fetch specific public fields to be safe, 
// OR rely on the public access policy if it's safe.
// The policy "Enable read access for all users" on chatbot_settings exists.
// So usage of standard admin client is fine to fetch by chatbot_id.

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const chatbotId = searchParams.get('chatbotId')

    if (!chatbotId) {
        return NextResponse.json({ error: 'Chatbot ID is required' }, { status: 400 })
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabase
            .from('chatbot_settings')
            .select('*')
            .eq('chatbot_id', chatbotId)
            .single()

        if (error) {
            // if no settings found, return defaults/null but not error 500
            if (error.code === 'PGRST116') {
                const response = NextResponse.json({ settings: null })
                response.headers.set('Access-Control-Allow-Origin', '*')
                return response
            }
            console.error("Supabase error fetching widget settings:", error)
            return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
        }

        // Return the full settings object. 
        // In a real prod app, you might want to filter out sensitive backend-only config if any existed,
        // but current fields seem safe for the widget to know (it needs to know if strict_faq is on, etc.)
        const response = NextResponse.json({ settings: data })
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response

    } catch (e) {
        console.error("Error in widget settings API:", e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
