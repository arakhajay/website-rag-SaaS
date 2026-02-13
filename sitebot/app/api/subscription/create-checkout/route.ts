import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/app/actions/subscription'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { planSlug, billingInterval } = body

        if (!planSlug) {
            return NextResponse.json({ error: 'Plan slug is required' }, { status: 400 })
        }

        const result = await createCheckoutSession(planSlug, billingInterval || 'monthly')

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json({ url: result.url })
    } catch (error: any) {
        console.error('[API] Create checkout error:', error)
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
    }
}
