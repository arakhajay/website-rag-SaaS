"use client"

import { 
    MessageSquare, 
    Slack, 
    Send, 
    MessageCircle, 
    Globe, 
    Zap, 
    ShoppingBag, 
    Database,
    ArrowUpRight
} from "lucide-react"

import Link from "next/link"

const integrations = [
    {
        name: "WhatsApp",
        slug: "whatsapp",
        description: "Engage with 2B+ users on the most popular messaging app in the world.",
        icon: <MessageCircle className="h-6 w-6 text-green-500" />,
        category: "Messaging",
        highlight: "Automate Support"
    },
    {
        name: "Slack",
        slug: "slack",
        description: "Bring AI power to your internal team conversations and workflows.",
        icon: <Slack className="h-6 w-6 text-purple-500" />,
        category: "Workspace",
        highlight: "Team Efficiency"
    },
    {
        name: "Telegram",
        slug: "telegram",
        description: "Deploy fast, secure AI bots to handle inquiries effortlessly.",
        icon: <Send className="h-6 w-6 text-sky-500" />,
        category: "Messaging",
        highlight: "Instant Bots"
    },
    {
        name: "Zapier",
        slug: "zapier",
        description: "Connect your AI to 5,000+ apps and automate almost anything.",
        icon: <Zap className="h-6 w-6 text-orange-500" />,
        category: "Automation",
        highlight: "Infinite Workflows"
    },
    {
        name: "WordPress",
        slug: "wordpress",
        description: "Embed your custom trained AI agent on any WordPress site in seconds.",
        icon: <Globe className="h-6 w-6 text-blue-600" />,
        category: "Web",
        highlight: "Custom Embeds"
    },
    {
        name: "Shopify",
        slug: "shopify",
        description: "Handle order tracking and product questions automatically.",
        icon: <ShoppingBag className="h-6 w-6 text-lime-600" />,
        category: "E-commerce",
        highlight: "Sales Assistant"
    },
    {
        name: "HubSpot",
        slug: "hubspot",
        description: "Sync every conversation and qualified lead directly to your CRM.",
        icon: <Database className="h-6 w-6 text-orange-600" />,
        category: "CRM",
        highlight: "Lead Sync"
    },
    {
        name: "Discord",
        slug: "discord",
        description: "Keep your community engaged 24/7 with intelligent automated responses.",
        icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
        category: "Workspace",
        highlight: "Community Support"
    }
]

export function Integrations() {
    return (
        <section id="integrations" className="container space-y-16 py-12 md:py-20 lg:py-24 overflow-hidden">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl text-center">
                    Connect Everywhere Your Users Are
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    SiteBot integrates seamlessly with the tools you already use. Deploy your agent across all platforms with a single click.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
                {integrations.map((item) => (
                    <Link 
                        href={`/integrations/${item.slug}`}
                        key={item.name}
                        className="group relative overflow-hidden rounded-2xl border bg-background p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10" />
                        
                        <div className="flex flex-col h-full space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="rounded-xl bg-muted p-2.5 transition-colors duration-300 group-hover:bg-primary/10">
                                    {item.icon}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                    {item.category}
                                </span>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-xl flex items-center gap-1.5 leading-none">
                                    {item.name}
                                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 text-primary" />
                                </h3>
                                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-4 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-semibold text-primary">
                                    {item.highlight}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Bottom Advantage Row */}
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 pt-12 border-t border-dashed">
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                    <div className="text-primary font-bold text-2xl">99.9%</div>
                    <div className="font-semibold text-foreground">Instant Sync</div>
                    <p className="text-sm text-muted-foreground italic">Changes to your knowledge base reflect across all channels instantly.</p>
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                    <div className="text-primary font-bold text-2xl">One-Click</div>
                    <div className="font-semibold text-foreground">Zero Code</div>
                    <p className="text-sm text-muted-foreground italic">No developers needed. Just connect your account and go live.</p>
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                    <div className="text-primary font-bold text-2xl">Omnichannel</div>
                    <div className="font-semibold text-foreground">Unified Inbox</div>
                    <p className="text-sm text-muted-foreground italic">View and handle all platform conversations from a single dashboard.</p>
                </div>
            </div>
        </section>
    )
}
