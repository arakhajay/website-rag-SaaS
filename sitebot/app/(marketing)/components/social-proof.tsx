export function SocialProof() {
    return (
        <section className="container py-8 md:py-12 border-t border-b bg-slate-50/50">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">Trusted by 5,000+ forward-thinking companies</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
                    {/* Placeholders for Logos. In production, use SVGs. */}
                    <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 bg-current rounded-full"></div> Acme Corp</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 bg-current rounded-full"></div> GlobalTech</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 bg-current rounded-full"></div> SASSy</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><div className="h-6 w-6 bg-current rounded-full"></div> NextGen</div>
                </div>
                <div className="pt-4 flex gap-8 text-sm text-muted-foreground">
                    <div><span className="font-bold text-foreground">25 Million</span> Messages Processed</div>
                    <div><span className="font-bold text-foreground">98%</span> Resolution Rate</div>
                </div>
            </div>
        </section>
    )
}
