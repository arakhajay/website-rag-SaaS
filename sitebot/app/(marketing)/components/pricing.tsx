import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Pricing() {
    return (
        <section id="pricing" className="container py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
                    Simple, Transparent Pricing.
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Start for free. Scale as you grow. Cancel anytime.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 lg:gap-12 pt-12">
                {/* Starter Plan */}
                <div className="flex flex-col rounded-xl border bg-background p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                        <h3 className="font-bold text-2xl">Starter</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">$39</span>
                            <span className="text-muted-foreground">/mo</span>
                        </div>
                        <p className="text-sm text-green-600 font-medium">Reduced from $49</p>
                        <p className="text-muted-foreground pt-2">Solopreneurs & Hobbyists</p>
                    </div>
                    <ul className="my-8 space-y-3">
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">1 Chatbot</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">2,000 Messages/mo</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">10M Char Storage</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">Web, PDF, Text Sources</span>
                        </li>
                    </ul>
                    <div className="mt-auto">
                        <Link href="/signup">
                            <Button className="w-full h-12" variant="outline">Start Free Trial</Button>
                        </Link>
                    </div>
                </div>

                {/* Professional Plan */}
                <div className="flex flex-col rounded-xl border bg-background p-8 shadow-xl ring-2 ring-primary relative scale-105">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground shadow-sm">
                        Most Popular
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-2xl">Professional</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">$89</span>
                            <span className="text-muted-foreground">/mo</span>
                        </div>
                        <p className="text-sm text-green-600 font-medium">Reduced from $99</p>
                        <p className="text-muted-foreground pt-2">Growing Startups</p>
                    </div>
                    <ul className="my-8 space-y-3">
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">5 Chatbots</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">10,000 Messages/mo</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm"><strong>Remove Branding</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">Notion & Drive Integration</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">GPT-4o Access</span>
                        </li>
                    </ul>
                    <div className="mt-auto">
                        <Link href="/signup">
                            <Button className="w-full h-12">Get Started</Button>
                        </Link>
                    </div>
                </div>

                {/* Business Plan */}
                <div className="flex flex-col rounded-xl border bg-background p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                        <h3 className="font-bold text-2xl">Business</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">$239</span>
                            <span className="text-muted-foreground">/mo</span>
                        </div>
                        <p className="text-sm text-green-600 font-medium">Reduced from $249</p>
                        <p className="text-muted-foreground pt-2">Agencies & Large Teams</p>
                    </div>
                    <ul className="my-8 space-y-3">
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">20 Chatbots</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">40,000 Messages/mo</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">White Label + Custom Domain</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">API & Webhooks</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">Dedicated Manager</span>
                        </li>
                    </ul>
                    <div className="mt-auto">
                        <Link href="/contact">
                            <Button className="w-full h-12" variant="outline">Contact Sales</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
