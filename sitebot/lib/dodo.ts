import DodoPayments from 'dodopayments'

let dodoClient: DodoPayments | null = null

export function getDodoClient(): DodoPayments {
    if (!dodoClient) {
        dodoClient = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
            environment: process.env.DODO_PAYMENTS_IS_LIVE === 'true' ? 'live_mode' : 'test_mode',
        })
    }
    return dodoClient
}

export type BillingInterval = 'monthly' | 'yearly'

export interface PlanConfig {
    id?: string
    name: string
    slug: string
    productId: string
    yearlyProductId: string
    price: number // monthly in cents
    yearlyPrice: number // yearly total in cents
    priceDisplay: string
    yearlyPriceDisplay: string // per-month equivalent
    yearlyTotalDisplay: string // full yearly price
    currency?: string
    description?: string
    messagesPerMonth: number
    maxChatbots: number
    maxTrainingSources?: number
    maxTrainingSizeMB: number
    maxTeamMembers?: number
    features: string[]
    limits?: {
        messagesPerMonth: number
        maxChatbots: number
        maxTrainingSizeMB: number
    }
    popular?: boolean
    isTest?: boolean
}

export const PLANS: Record<string, PlanConfig> = {
    free: {
        name: 'Free Plan',
        slug: 'free',
        productId: 'free_tier',
        yearlyProductId: 'free_tier',
        price: 0,
        yearlyPrice: 0,
        priceDisplay: 'Free',
        yearlyPriceDisplay: 'Free',
        yearlyTotalDisplay: 'Free',
        messagesPerMonth: 0,
        maxChatbots: 0,
        maxTrainingSources: 0,
        maxTrainingSizeMB: 0,
        maxTeamMembers: 1,
        features: ['Upgrade to create chatbots'],
        isTest: false,
    },
    test: {
        name: 'Test Plan',
        slug: 'test',
        productId: 'pdt_0NYBbibFfeEiVG5kRvo50',
        yearlyProductId: 'pdt_0NYBbibFfeEiVG5kRvo50',
        price: 10,
        yearlyPrice: 10,
        priceDisplay: '$0.10',
        yearlyPriceDisplay: '$0.10',
        yearlyTotalDisplay: '$1.00',
        currency: 'USD',
        description: 'Perfect for trying out 7ivox',
        features: [
            '10 free messages/month',
            '1 chatbot',
            '100K char training limit (~25 pages)',
            'Basic analytics'
        ],
        messagesPerMonth: 10,
        maxChatbots: 1,
        maxTrainingSizeMB: 0.1, // ~100KB or 25 pages

        isTest: true,
    },
    starter: {
        name: 'Starter',
        slug: 'starter',
        productId: 'pdt_0NYPIs3eQQQOW58zpgPvk',
        yearlyProductId: 'pdt_0NYPIs6qNF0iLsJtKYu7d',
        price: 1500,
        yearlyPrice: 14400,
        priceDisplay: '$15',
        yearlyPriceDisplay: '$12',
        yearlyTotalDisplay: '$144',
        messagesPerMonth: 2000,
        maxChatbots: 2,
        maxTrainingSources: 10,
        maxTrainingSizeMB: 10,
        maxTeamMembers: 1,
        features: [
            '2,000 messages/month',
            '2 chatbots',
            '10MB training limit (~2.5k pages)',
            'Remove 7ivox branding',
            'Priority support',
        ],
    },
    growth: {
        name: 'Growth',
        slug: 'growth',
        productId: 'pdt_0NYPIs4Q1t8IEj1fs11st',
        yearlyProductId: 'pdt_0NYPIs7S8SNQqhpyAhfez',
        price: 4900,
        yearlyPrice: 46800,
        priceDisplay: '$49',
        yearlyPriceDisplay: '$39',
        yearlyTotalDisplay: '$468',
        messagesPerMonth: 5000,
        maxChatbots: 5,
        maxTrainingSources: 25,
        maxTrainingSizeMB: 25,
        maxTeamMembers: 2,
        features: [
            '5,000 messages/month',
            '5 chatbots',
            '25MB training limit (~6k pages)',
            'Advanced analytics',
            'API access',
        ],
        popular: true,
    },
    professional: {
        name: 'Professional',
        slug: 'professional',
        productId: 'pdt_0NYPIs5QjRtHzfB4liaZv',
        yearlyProductId: 'pdt_0NYPIs8Glv54Qc8e8HgQz',
        price: 12900,
        yearlyPrice: 123600,
        priceDisplay: '$129',
        yearlyPriceDisplay: '$103',
        yearlyTotalDisplay: '$1,236',
        messagesPerMonth: 15000,
        maxChatbots: 10,
        maxTrainingSources: 50,
        maxTrainingSizeMB: 75,
        maxTeamMembers: 5,
        features: [
            '15,000 messages/month',
            '10 chatbots',
            '75MB training limit (~18k pages)',
            'Team collaboration',
            'Custom integrations',
        ],
    },
    enterprise: {
        name: 'Enterprise',
        slug: 'enterprise',
        productId: 'pdt_0NYPIs6CLRuzNBNfgEqd8',
        yearlyProductId: 'pdt_0NYPIs8yZxohgTZUr8U52',
        price: 39900,
        yearlyPrice: 382800,
        priceDisplay: '$399',
        yearlyPriceDisplay: '$319',
        yearlyTotalDisplay: '$3,828',
        messagesPerMonth: 999999,
        maxChatbots: 999,
        maxTrainingSources: 999,
        maxTrainingSizeMB: 100,
        maxTeamMembers: 999,
        features: [
            'Unlimited messages',
            'Unlimited chatbots',
            'Unlimited training',
            'Dedicated success manager',
            'SLA & Uptime guarantees',
        ],
    },
}

export function getPlanByProductId(productId: string): PlanConfig | undefined {
    return Object.values(PLANS).find((plan) => plan.productId === productId || plan.yearlyProductId === productId)
}

export function getPlanBySlug(slug: string): PlanConfig | undefined {
    return PLANS[slug]
}

export function getVisiblePlans(): PlanConfig[] {
    const isDev = process.env.NODE_ENV === 'development'
    return Object.values(PLANS).filter((plan) => isDev || !plan.isTest)
}
