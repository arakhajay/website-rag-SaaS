import { Hero } from "./components/hero"
import { SocialProof } from "./components/social-proof"
import { Features } from "./components/features"
import { Pricing } from "./components/pricing"
import { FAQ } from "./components/faq"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center">
            <Hero />
            <SocialProof />
            <Features />
            <Pricing />
            <FAQ />

            {/* Final CTA Section */}
            <section className="py-24 text-center">
                <div className="container max-w-[58rem] space-y-6">
                    <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                        Ready to Automate Your Business?
                    </h2>
                    <p className="text-muted-foreground text-xl">
                        Join thousands of founders saving time and money with SiteBot.
                    </p>
                    <Link href="/signup">
                        <Button size="lg" className="h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-700">
                            Build Your AI Agent for Free
                        </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground">No credit card required.</p>
                </div>
            </section>
        </div>
    )
}
