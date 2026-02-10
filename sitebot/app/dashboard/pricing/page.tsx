'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Zap, Crown, Building2, FlaskConical, Loader2 } from 'lucide-react'

const PLANS = [
    {
        slug: 'test',
        name: 'Test Plan',
        price: '$0.10',
        period: '/month',
        description: 'For development and testing only',
        icon: FlaskConical,
        features: ['100 messages/month', '1 chatbot', '5 training sources', 'Basic analytics'],
        isTest: true,
        gradient: 'from-slate-500 to-slate-700',
        accent: 'slate',
    },
    {
        slug: 'starter',
        name: 'Starter',
        price: '$15',
        period: '/month',
        description: 'Perfect for individuals and small merchants',
        icon: Sparkles,
        features: [
            '1,000 messages/month',
            '1 chatbot',
            '10 training sources',
            '30-day chat log retention',
            'Lead capture',
            'Basic analytics',
        ],
        gradient: 'from-blue-500 to-cyan-500',
        accent: 'blue',
    },
    {
        slug: 'growth',
        name: 'Growth',
        price: '$49',
        period: '/month',
        description: 'For growing businesses needing more power',
        icon: Zap,
        features: [
            '3,000 messages/month',
            '3 chatbots',
            '25 training sources',
            '90-day chat log retention',
            'Lead capture',
            'Advanced analytics',
            '2 team members',
        ],
        popular: true,
        gradient: 'from-violet-500 to-purple-600',
        accent: 'violet',
    },
    {
        slug: 'professional',
        name: 'Professional',
        price: '$129',
        period: '/month',
        description: 'For power users and small teams',
        icon: Crown,
        features: [
            '12,000 messages/month',
            '5 chatbots',
            '50 training sources',
            '1-year chat log retention',
            'Lead capture',
            'Advanced analytics',
            '5 team members',
            'Branding removal',
            'API access',
            'Priority support',
        ],
        gradient: 'from-amber-500 to-orange-500',
        accent: 'amber',
    },
    {
        slug: 'enterprise',
        name: 'Enterprise',
        price: '$399',
        period: '/month',
        description: 'For large organizations',
        icon: Building2,
        features: [
            'Unlimited messages',
            'Unlimited chatbots',
            'Unlimited training sources',
            'Unlimited chat log retention',
            'Lead capture',
            'Custom analytics',
            'Unlimited team members',
            'Branding removal',
            'API access',
            'Priority support',
            'Dedicated account manager',
        ],
        gradient: 'from-emerald-500 to-teal-600',
        accent: 'emerald',
    },
]

export default function PricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
    const router = useRouter()
    const isDev = process.env.NODE_ENV === 'development'

    const visiblePlans = PLANS.filter((p) => isDev || !p.isTest)

    const handleSelectPlan = async (slug: string) => {
        setLoadingPlan(slug)
        try {
            const res = await fetch('/api/subscription/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planSlug: slug }),
            })
            const data = await res.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                alert(data.error || 'Failed to create checkout session')
            }
        } catch (err) {
            alert('Something went wrong. Please try again.')
        } finally {
            setLoadingPlan(null)
        }
    }

    return (
        <div className="space-y-10 pb-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    7-day free trial on all plans
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                    Choose your plan
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Start with a 7-day free trial. No credit card charged until your trial ends.
                    Cancel anytime.
                </p>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visiblePlans.map((plan) => {
                    const Icon = plan.icon
                    return (
                        <Card
                            key={plan.slug}
                            className={`relative flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                plan.popular
                                    ? 'border-2 border-primary shadow-lg shadow-primary/10'
                                    : 'border border-border/50 hover:border-primary/30'
                            }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                                        <Zap className="h-3 w-3" />
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            {/* Test Badge */}
                            {plan.isTest && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-black shadow-lg">
                                        <FlaskConical className="h-3 w-3" />
                                        Dev Only
                                    </span>
                                </div>
                            )}

                            <CardHeader className="pb-4 pt-8">
                                <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-lg`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-6">
                                {/* Price */}
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.period}</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-2.5">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                                            <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-4">
                                <Button
                                    className={`w-full ${
                                        plan.popular
                                            ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25'
                                            : ''
                                    }`}
                                    variant={plan.popular ? 'default' : 'outline'}
                                    size="lg"
                                    onClick={() => handleSelectPlan(plan.slug)}
                                    disabled={loadingPlan !== null}
                                >
                                    {loadingPlan === plan.slug ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Start Free Trial'
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {/* Footer Note */}
            <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                    All plans include a 7-day free trial. Your card won&apos;t be charged until the trial ends.
                </p>
                <p className="text-xs text-muted-foreground/60">
                    Prices in USD. Cancel anytime from your dashboard.
                </p>
            </div>
        </div>
    )
}
