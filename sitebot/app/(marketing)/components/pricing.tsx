'use client'

import { useState } from 'react'
import Link from "next/link"
import { Check, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PLANS, PlanConfig, BillingInterval } from "@/lib/dodo"
import { cn } from "@/lib/utils"

export function Pricing() {
    const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly')
    const isYearly = billingInterval === 'yearly'

    // Select specific plans in order
    const planOrder = ['starter', 'growth', 'professional', 'enterprise']
    const displayPlans = planOrder.map(slug => PLANS[slug]).filter(Boolean) as PlanConfig[]

    return (
        <section id="pricing" className="container py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                    Simple, Transparent Pricing.
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Start with a <strong>7-day free trial</strong>. No commitment, cancel anytime.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3 pt-4">
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
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 pt-12">
                {displayPlans.map((plan) => {
                    const isPopular = plan.popular
                    const displayPrice = isYearly ? plan.yearlyPriceDisplay : plan.priceDisplay
                    return (
                        <div 
                            key={plan.slug}
                            className={cn(
                                "flex flex-col rounded-xl border bg-background p-6 shadow-sm hover:shadow-md transition-shadow relative",
                                isPopular && "shadow-xl ring-2 ring-primary scale-105 z-10"
                            )}
                        >
                            {isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground shadow-sm">
                                    Most Popular
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <h3 className="font-bold text-2xl">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">{displayPrice}</span>
                                    <span className="text-muted-foreground text-sm">/mo</span>
                                </div>
                                {isYearly && (
                                    <p className="text-xs text-muted-foreground">
                                        Billed {plan.yearlyTotalDisplay}/year
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground pt-1 min-h-[40px]">
                                    {plan.slug === 'starter' && "For individuals & new merchants"}
                                    {plan.slug === 'growth' && "For growing businesses"}
                                    {plan.slug === 'professional' && "For power users & small teams"}
                                    {plan.slug === 'enterprise' && "For large organizations"}
                                </p>
                            </div>

                            <ul className="my-6 space-y-2 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                        <span className="text-xs sm:text-sm text-left">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto pt-4">
                                <Link href={plan.slug === 'enterprise' ? "/contact" : "/login"}>
                                    <Button 
                                        className="w-full" 
                                        variant={isPopular ? "default" : "outline"}
                                    >
                                        {plan.slug === 'enterprise' ? "Contact Sales" : "Start Free Trial"}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
            
            <div className="mx-auto mt-12 max-w-[58rem] text-center text-muted-foreground">
                <p>Looking for a custom solution? <Link href="/contact" className="underline underline-offset-4 hover:text-primary">Contact us</Link>.</p>
            </div>
        </section>
    )
}
