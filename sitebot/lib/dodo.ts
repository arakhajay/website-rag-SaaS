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
    name: string
    slug: string
    productId: string
    yearlyProductId: string
    price: number // monthly in cents
    yearlyPrice: number // yearly total in cents
    priceDisplay: string
    yearlyPriceDisplay: string // per-month equivalent
    yearlyTotalDisplay: string // full yearly price
    messagesPerMonth: number
    maxChatbots: number
    maxTrainingSources: number
    maxTrainingSizeMB: number
    maxTeamMembers: number
    features: string[]
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
        yearlyProductId: 'pdt_0NYBbibFfeEiVG5kRvo50', // no yearly for test
        price: 10,
        yearlyPrice: 100,
        priceDisplay: '$0.10',
        yearlyPriceDisplay: '$0.08',
        yearlyTotalDisplay: '$1.00',
        messagesPerMonth: 100,
        maxChatbots: 1,
        maxTrainingSources: 5,
        maxTrainingSizeMB: 5,
        maxTeamMembers: 1,
        features: ['100 messages/month', '1 chatbot', '5 training sources', '5MB training limit', 'Basic analytics'],
        isTest: true,
    },
    starter: {
        name: 'Starter',
        slug: 'starter',
        productId: 'pdt_0NYBbojOqhoZtNDoF14Mp',
        yearlyProductId: 'pdt_0NYOcmrQWB3e5IbgKPJDM',
        price: 1500,
        yearlyPrice: 14400,
        priceDisplay: '$15',
        yearlyPriceDisplay: '$12',
        yearlyTotalDisplay: '$144',
        messagesPerMonth: 1000,
        maxChatbots: 1,
        maxTrainingSources: 10,
        maxTrainingSizeMB: 10,
        maxTeamMembers: 1,
        features: [
            '1,000 messages/month',
            '1 chatbot',
            '10 training sources',
            '10MB training limit',
            '30-day chat log retention',
            'Lead capture',
            'Basic analytics',
        ],
    },
    growth: {
        name: 'Growth',
        slug: 'growth',
        productId: 'pdt_0NYBbomZHGBm8TScglTeg',
        yearlyProductId: 'pdt_0NYOcmwIh9tdTrwIrmuMv',
        price: 4900,
        yearlyPrice: 46800,
        priceDisplay: '$49',
        yearlyPriceDisplay: '$39',
        yearlyTotalDisplay: '$468',
        messagesPerMonth: 3000,
        maxChatbots: 3,
        maxTrainingSources: 25,
        maxTrainingSizeMB: 25,
        maxTeamMembers: 2,
        features: [
            '3,000 messages/month',
            '3 chatbots',
            '25 training sources',
            '25MB training limit',
            '90-day chat log retention',
            'Lead capture',
            'Advanced analytics',
            '2 team members',
        ],
        popular: true,
    },
    professional: {
        name: 'Professional',
        slug: 'professional',
        productId: 'pdt_0NYBboqhLbjmtfSoUgi6H',
        yearlyProductId: 'pdt_0NYOcmzgjGY0iNwY1adrI',
        price: 12900,
        yearlyPrice: 123600,
        priceDisplay: '$129',
        yearlyPriceDisplay: '$103',
        yearlyTotalDisplay: '$1,236',
        messagesPerMonth: 12000,
        maxChatbots: 5,
        maxTrainingSources: 50,
        maxTrainingSizeMB: 50,
        maxTeamMembers: 5,
        features: [
            '12,000 messages/month',
            '5 chatbots',
            '50 training sources',
            '50MB training limit',
            '1-year chat log retention',
            'Lead capture',
            'Advanced analytics',
            '5 team members',
            'Branding removal',
            'API access',
            'Priority support',
        ],
    },
    enterprise: {
        name: 'Enterprise',
        slug: 'enterprise',
        productId: 'pdt_0NYBbou1bl5ReyqkYBmlC',
        yearlyProductId: 'pdt_0NYOcn8aBNfgxKFj5vLyd',
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
            'Unlimited training sources',
            'Unlimited training data',
            'Unlimited chat log retention',
            'Lead capture',
            'Custom analytics',
            'Unlimited team members',
            'Branding removal',
            'API access',
            'Priority support',
            'Dedicated account manager',
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
