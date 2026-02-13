'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Zap, Crown, Building2, Loader2 } from 'lucide-react'
import { BillingInterval } from '@/lib/dodo'

const PLANS = [
    {
        slug: 'starter',
        name: 'Starter',
        monthlyPrice: '$15',
        yearlyPrice: '$12',
        yearlyTotal: '$144',
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
    },
    {
        slug: 'growth',
        name: 'Growth',
        monthlyPrice: '$49',
        yearlyPrice: '$39',
        yearlyTotal: '$468',
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
    },
    {
        slug: 'professional',
        name: 'Professional',
        monthlyPrice: '$129',
        yearlyPrice: '$103',
        yearlyTotal: '$1,236',
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
    },
    {
        slug: 'enterprise',
        name: 'Enterprise',
        monthlyPrice: '$399',
        yearlyPrice: '$319',
        yearlyTotal: '$3,828',
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
    },
]

export default function PricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
    const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly')
    const router = useRouter()
    const isYearly = billingInterval === 'yearly'

    const handleSelectPlan = async (slug: string) => {
        setLoadingPlan(slug)
        try {
            const res = await fetch('/api/subscription/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planSlug: slug, billingInterval }),
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

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3 pt-2">
                    <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setBillingInterval(isYearly ? 'monthly' : 'yearly')}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isYearly ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                isYearly ? 'translate-x-8' : 'translate-x-1'
                            }`}
                        />
                    </button>
                    <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Yearly
                    </span>
                    {isYearly && (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400 ring-1 ring-green-500/20">
                            Save 20%
                        </span>
                    )}
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {PLANS.map((plan) => {
                    const Icon = plan.icon
                    const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice
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


                            <CardHeader className="pb-4 pt-8">
                                <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-lg`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-6">
                                {/* Price */}
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold tracking-tight">{displayPrice}</span>
                                        <span className="text-muted-foreground">/mo</span>
                                    </div>
                                    {isYearly && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Billed {plan.yearlyTotal}/year
                                        </p>
                                    )}
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
