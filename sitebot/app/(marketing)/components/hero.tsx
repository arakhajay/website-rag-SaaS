import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
                    The AI Agent That Works <br className="hidden sm:inline" />
                    <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">While You Sleep.</span>
                </h1>
                <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    Train a custom ChatGPT on your website, PDFs, and Notion docs in 2 minutes. Capture leads, resolve support tickets, and trigger complex workflows automatically.
                </p>
                <div className="space-x-4">
                    <Link href="/signup">
                        <Button size="lg" className="h-12 px-8 text-lg bg-indigo-600 hover:bg-indigo-700">Build Your AI Agent for Free</Button>
                    </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                    Join 10,000+ businesses saving 20 hours/week. No credit card required.
                </p>

                {/* Hero Visual */}
                <div className="mt-10 relative w-full aspect-video rounded-xl border bg-muted/50 overflow-hidden shadow-xl">
                    <Image
                        src="/images/hero-visual.gif"
                        alt="SiteBot AI Agent in Action"
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                </div>
            </div>
        </section>
    )
}
