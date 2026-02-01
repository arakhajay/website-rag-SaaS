import { ArrowRight, Bot, Database, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Features() {
    return (
        <section id="features" className="container space-y-16 py-12 md:py-20 lg:py-24">
            {/* Feature 1: Lead Capture */}
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Stop Using Static Forms. Start Having Conversations.</h2>
                    <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                        Static contact forms are relics of the past. Our LLM-powered agent engages visitors the moment they show intent. It doesn&apos;t just ask for an email; it holds a natural conversation to qualify the prospect based on your criteria.
                    </p>
                    <ul className="mt-8 space-y-4">
                        <li className="flex items-start gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">1</span>
                            <div>
                                <span className="font-bold">Engage:</span> Detect high-intent visitors on pricing pages.
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">2</span>
                            <div>
                                <span className="font-bold">Qualify:</span> Analyze responses to determine budget and urgency.
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">3</span>
                            <div>
                                <span className="font-bold">Capture:</span> Push qualified leads instantly to your CRM.
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="rounded-xl border bg-muted/50 p-8 shadow-sm">
                    {/* Visualization Placeholder */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><Bot size={20} /></div>
                            <div className="bg-background border rounded-lg p-3 text-sm shadow-sm max-w-[80%]">
                                Hi! Noticed you&apos;re looking at Enterprise. Team size &gt; 50?
                            </div>
                        </div>
                        <div className="flex gap-4 flex-row-reverse">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">U</div>
                            <div className="bg-primary text-primary-foreground rounded-lg p-3 text-sm shadow-sm max-w-[80%]">
                                Yes, about 120 employees. We need SSO.
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><Bot size={20} /></div>
                            <div className="bg-background border rounded-lg p-3 text-sm shadow-sm max-w-[80%]">
                                Perfect. I can have a quote sent instantly. Best email?
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature 2: Workflow Automation */}
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                <div className="lg:order-2">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">An Agent That Does the Work, Not Just the Talk.</h2>
                    <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                        Answering questions is just the beginning. Connect your agent to your existing tools via API to perform real work. From checking orders to booking meetings, your AI handles end-to-end workflows.
                    </p>
                    <div className="mt-8 rounded-lg border bg-background shadow-sm overflow-hidden">
                        <div className="grid grid-cols-3 bg-muted p-4 text-xs font-semibold uppercase text-muted-foreground">
                            <div>Industry</div>
                            <div>Trigger</div>
                            <div>AI Action</div>
                        </div>
                        <div className="divide-y">
                            <div className="grid grid-cols-3 p-4 text-sm items-center">
                                <div className="font-medium">E-Commerce</div>
                                <div className="text-muted-foreground">&quot;Where is my order?&quot;</div>
                                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded w-fit">Queries Shopify API</div>
                            </div>
                            <div className="grid grid-cols-3 p-4 text-sm items-center">
                                <div className="font-medium">SaaS Sales</div>
                                <div className="text-muted-foreground">&quot;I want a demo.&quot;</div>
                                <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded w-fit">Books Calendly</div>
                            </div>
                            <div className="grid grid-cols-3 p-4 text-sm items-center">
                                <div className="font-medium">HR</div>
                                <div className="text-muted-foreground">&quot;How to file expenses?&quot;</div>
                                <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded w-fit">Sends Policy PDF</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:order-1 rounded-xl border bg-muted/50 p-8 flex items-center justify-center aspect-square md:aspect-auto">
                    <Zap className="h-32 w-32 text-primary/20" />
                </div>
            </div>

            {/* Feature 3: Trust & Accuracy */}
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Accuracy You Can Trust. Citations You Can Verify.</h2>
                    <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                        Our proprietary &apos;Truth-First&apos; engine ensures your bot sticks strictly to the data you provide. It won&apos;t improvise. Every answer comes with a &apos;Clickable Citation,&apos; showing exactly which document or webpage the information was sourced from.
                    </p>
                    <div className="mt-8">
                        <Button variant="outline" className="gap-2">
                            Read our Security Whitepaper <ArrowRight size={16} />
                        </Button>
                    </div>
                </div>
                <div className="rounded-xl border bg-muted/50 p-8 relative overflow-hidden">
                    <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Database size={12} /> Source Verified
                    </div>
                    <div className="space-y-4 mt-8">
                        <div className="bg-background border rounded-lg p-4 shadow-sm">
                            <p className="text-sm">Based on your <span className="font-semibold text-primary underline decoration-dotted">return_policy.pdf (Page 4)</span>, customers can return items within 30 days if unworn.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
