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

export interface PlanConfig {
    name: string
    slug: string
    productId: string
    price: number // in cents
    priceDisplay: string
    messagesPerMonth: number
    maxChatbots: number
    maxTrainingSources: number
    maxTrainingSizeMB: number // Limit per source or total? Assuming max size per source for simplicity or total? Let's say max size per file upload.
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
        price: 0,
        priceDisplay: 'Free',
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
        price: 10,
        priceDisplay: '$0.10',
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
        price: 1500,
        priceDisplay: '$15',
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
        price: 4900,
        priceDisplay: '$49',
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
        price: 12900,
        priceDisplay: '$129',
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
        price: 39900,
        priceDisplay: '$399',
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
    return Object.values(PLANS).find((plan) => plan.productId === productId)
}

export function getPlanBySlug(slug: string): PlanConfig | undefined {
    return PLANS[slug]
}

export function getVisiblePlans(): PlanConfig[] {
    const isDev = process.env.NODE_ENV === 'development'
    return Object.values(PLANS).filter((plan) => isDev || !plan.isTest)
}
