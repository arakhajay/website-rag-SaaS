'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Zap, Crown, Building2, Loader2, CreditCard } from 'lucide-react'
import { BillingInterval, PlanConfig, PLANS as ALL_PLANS } from '@/lib/dodo'
import { getSubscriptionWithPlan } from '@/app/actions/subscription'
import { CancelSubscriptionModal } from './components/cancel-modal'

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
    const [currentSubscription, setCurrentSubscription] = useState<any>(null)
    const [loadingSubscription, setLoadingSubscription] = useState(true)
    const router = useRouter()
    const isYearly = billingInterval === 'yearly'

    useEffect(() => {
        async function fetchSubscription() {
            setLoadingSubscription(true)
            try {
                const { subscription, plan, error } = await getSubscriptionWithPlan()
                if (subscription) {
                        setCurrentSubscription({ ...subscription, planDetails: plan })
                }
            } catch (err) {
                console.error("Failed to fetch subscription", err)
            } finally {
                setLoadingSubscription(false)
            }
        }
        fetchSubscription()
    }, [])

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
                
                {/* Active Subscription Card */}
                {loadingSubscription ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : currentSubscription ? (
                    <div className="mx-auto max-w-2xl mt-8">
                        <div className={`rounded-xl border shadow-sm overflow-hidden ${
                            currentSubscription.status === 'cancelled' 
                                ? 'bg-orange-50 border-orange-200' 
                                : 'bg-primary/5 border-primary/20'
                        }`}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${
                                            currentSubscription.status === 'cancelled'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-primary/10 text-primary'
                                        }`}>
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">Current Subscription</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {currentSubscription.status === 'cancelled' 
                                                    ? 'Access ending soon' 
                                                    : 'Active & renewing'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                        currentSubscription.status === 'cancelled'
                                            ? 'bg-orange-100 text-orange-700'
                                            : currentSubscription.status === 'trialing'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                    }`}>
                                        {currentSubscription.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Plan</p>
                                        <p className="text-xl font-bold">{currentSubscription.planDetails?.name || currentSubscription.plan_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                            {currentSubscription.status === 'cancelled' ? 'Access Ends On' : 'Next Billing'}
                                        </p>
                                        <p className="text-xl font-bold">
                                            {new Date(currentSubscription.current_period_end || currentSubscription.trial_ends_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {currentSubscription.status === 'cancelled' && (
                                    <div className="mt-6 bg-orange-100/50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                                        Your subscription has been cancelled and you will not be charged again. 
                                        You have full access until the date above.
                                    </div>
                                )}
                            </div>
                            
                            {(currentSubscription.status === 'active' || currentSubscription.status === 'trialing' || currentSubscription.status === 'pending') && (
                                <div className="bg-white/50 px-6 py-4 border-t border-primary/10 flex justify-end">
                                    <CancelSubscriptionModal onCancelSuccess={() => window.location.reload()} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Billing Toggle only if no active subscription */
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
                )}
            </div>

            {/* Plans Grid - Always visible now */}
            <div className={`grid gap-6 md:grid-cols-2 xl:grid-cols-3 ${currentSubscription ? 'opacity-90' : ''}`}>
                {PLANS.map((plan) => {
                    const Icon = plan.icon
                    const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice
                    // Match current subscription by slug if possible, or fallback
                    const isCurrentPlan = currentSubscription?.planDetails?.slug === plan.slug
                    
                    return (
                        <Card
                            key={plan.slug}
                            className={`relative flex flex-col transition-all duration-300 ${
                                plan.popular
                                    ? 'border-2 border-primary shadow-lg shadow-primary/10'
                                    : 'border border-border/50 hover:border-primary/30'
                            } ${isCurrentPlan ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
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
                                {isCurrentPlan && currentSubscription.status !== 'cancelled' ? (
                                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled>
                                        Current Plan
                                    </Button>
                                ) : (
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
                                            currentSubscription ? (isCurrentPlan ? 'Re-activate' : 'Switch/Upgrade') : 'Start Free Trial'
                                        )}
                                    </Button>
                                )}
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
