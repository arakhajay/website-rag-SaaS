import { getAllIntegrations } from "@/lib/integrations-data"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export default function IntegrationsListingPage() {
    const integrations = getAllIntegrations()

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="py-20 bg-muted/30 text-center">
                <div className="container px-4 max-w-[58rem] space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                        Integrations
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Connect Zivox Agent to your favorite platforms and automate your business workflows in minutes.
                    </p>
                </div>
            </section>

            {/* List Section */}
            <section className="py-20 px-4">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {integrations.map((item) => (
                            <Link 
                                href={`/integrations/${item.slug}`} 
                                key={item.slug}
                                className="group relative flex flex-col p-8 rounded-2xl border bg-background transition-all hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="p-3 rounded-xl bg-muted w-fit mb-6 transition-colors group-hover:bg-primary/10">
                                    {item.icon}
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xs font-bold uppercase tracking-wider text-primary">
                                        {item.category}
                                    </div>
                                    <h3 className="text-2xl font-bold flex items-center gap-2">
                                        {item.title}
                                        <ArrowUpRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </h3>
                                    <p className="text-muted-foreground line-clamp-3">
                                        {item.subtitle}
                                    </p>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-dashed flex items-center text-sm font-semibold text-primary">
                                    View Details <ArrowUpRight className="ml-1 h-3 w-3" />
                                </div>
                            </Link>
                        ))}
                        
                        {/* Coming Soon Placeholder */}
                        <div className="flex flex-col p-8 rounded-2xl border border-dashed bg-muted/10 items-center justify-center text-center space-y-4">
                            <div className="text-muted-foreground text-sm font-medium">Coming Soon</div>
                            <h3 className="text-xl font-bold italic">Custom Webhooks, Intercom, Zendesk & more...</h3>
                            <Link href="/login">
                                <Button variant="link" className="text-primary font-bold">Request an Integration</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 text-center bg-muted/20 border-t">
                <div className="container max-w-[58rem] space-y-6">
                    <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                        Can't find what you need?
                    </h2>
                    <p className="text-muted-foreground text-xl">
                        Our API allows you to build custom integrations for your unique business needs.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/login">
                            <Button size="lg" className="h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-700">
                                Start Building
                            </Button>
                        </Link>
                        <Link href="/docs">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                                Read API Docs
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
