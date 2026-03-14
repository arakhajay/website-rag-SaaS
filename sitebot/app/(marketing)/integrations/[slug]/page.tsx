import { getIntegrationBySlug } from "@/lib/integrations-data"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
    CheckCircle2, 
    ArrowLeft, 
    ArrowRight,
    Zap,
    ShieldCheck,
    Clock,
    User,
    Bot,
    Send,
    MessageCircle,
    Slack,
    MessageSquare,
    Globe
} from "lucide-react"

export default async function IntegrationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const integration = getIntegrationBySlug(slug)

    if (!integration) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 bg-muted/30">
                <div className="container px-4">
                    <Link 
                        href="/integrations" 
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Integrations
                    </Link>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="p-4 rounded-2xl bg-background shadow-lg border">
                            {integration.icon}
                        </div>
                        <div>
                            <div className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
                                {integration.category} Integration
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                                {integration.title}
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                                {integration.subtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Chat Simulation & Description */}
            <section className="py-16 bg-background">
                <div className="container px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">See it in Action</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {integration.description}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Key Advantages</h3>
                                <div className="grid sm:grid-cols-1 gap-4">
                                    {integration.benefits.map((benefit, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-xl border bg-card">
                                            <div className="mt-1">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{benefit.title}</h4>
                                                <p className="text-sm text-muted-foreground mt-0.5">{benefit.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="pt-4">
                                <Link href="/login">
                                    <Button className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold">
                                        Start Your {integration.title} Agent
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Platform Chat Simulator */}
                        <div className="relative group">
                            {/* Decorative background glow */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-purple-500/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative rounded-3xl border shadow-2xl overflow-hidden bg-background max-w-[400px] mx-auto">
                                {/* Header */}
                                <div className={`p-4 flex items-center justify-between border-b ${
                                    integration.chatSimulation.platform === 'whatsapp' ? 'bg-[#075E54] text-white' :
                                    integration.chatSimulation.platform === 'slack' ? 'bg-[#4A154B] text-white' :
                                    integration.chatSimulation.platform === 'discord' ? 'bg-[#313338] text-white' :
                                    'bg-background border-b'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-white/10">
                                            <Bot className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">Zivox AI Agent</div>
                                            <div className="text-[10px] opacity-80 flex items-center gap-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> online
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 opacity-60">
                                        <div className="h-2 w-2 rounded-full border" />
                                        <div className="h-2 w-2 rounded-full border" />
                                        <div className="h-2 w-2 rounded-full border" />
                                    </div>
                                </div>

                                {/* Chat Body */}
                                <div className={`h-[450px] overflow-y-auto p-4 space-y-4 ${
                                    integration.chatSimulation.platform === 'whatsapp' ? 'bg-[#E5DDD5]' :
                                    integration.chatSimulation.platform === 'discord' ? 'bg-[#313338]' :
                                    'bg-muted/30'
                                }`}>
                                    {integration.chatSimulation.messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                                                msg.role === 'user' 
                                                    ? (integration.chatSimulation.platform === 'whatsapp' ? 'bg-[#DCF8C6] text-black border-l-4 border-green-500' : 'bg-primary text-primary-foreground')
                                                    : (integration.chatSimulation.platform === 'whatsapp' ? 'bg-white text-black' : 
                                                       integration.chatSimulation.platform === 'discord' ? 'bg-[#2B2D31] text-white border border-white/5' :
                                                       'bg-background border')
                                            }`}>
                                                {msg.content}
                                                <div className="text-[10px] mt-1 opacity-50 text-right">
                                                    10:0{i+1} AM
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer Input */}
                                <div className="p-4 border-t bg-background flex items-center gap-3">
                                    <div className="flex-1 h-10 rounded-full bg-muted/50 px-4 flex items-center text-xs text-muted-foreground italic">
                                        Type a message...
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                        <Send className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Floating Platform Icon */}
                            <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-2xl bg-background border shadow-xl flex items-center justify-center scale-110 group-hover:scale-125 transition-transform duration-500">
                                {integration.icon}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-20 bg-muted/20">
                <div className="container px-4">
                    <div className="flex flex-col items-center text-center space-y-4 mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it helps your business</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Unlock new levels of efficiency by deploying {integration.title} intelligence specifically tailored to your industry.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {integration.useCases.map((useCase, idx) => (
                            <div key={idx} className="group p-8 rounded-2xl border bg-background shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h4 className="font-bold text-xl mb-3">{useCase.title}</h4>
                                <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-20">
                <div className="container px-4 max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground">Everything you need to know about the {integration.title} integration.</p>
                    </div>
                    <div className="space-y-6">
                        {integration.faqs.map((faq, idx) => (
                            <div key={idx} className="p-6 rounded-2xl border bg-card/50 hover:bg-card transition-colors">
                                <h4 className="font-bold text-lg mb-2 flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    {faq.question}
                                </h4>
                                <p className="text-muted-foreground leading-relaxed pl-5">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-16 p-8 rounded-3xl border border-dashed border-primary/50 bg-primary/5 text-center">
                        <h3 className="font-bold text-2xl mb-2">Have a custom workflow?</h3>
                        <p className="text-muted-foreground mb-8 text-lg">Our engineering team can help you build advanced automations for {integration.title}.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button className="h-12 px-6 bg-primary font-bold">Talk to Sales</Button>
                            <Button variant="outline" className="h-12 px-6 font-bold">View Documentation</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 text-center bg-indigo-600 text-white overflow-hidden relative">
                {/* Background Patterns */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 border-[40px] border-white rounded-full" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 border-[60px] border-white rounded-full" />
                </div>
                
                <div className="container max-w-[58rem] space-y-8 relative z-10">
                    <h2 className="font-heading text-3xl font-bold sm:text-5xl md:text-6xl text-white">
                        Scale Your {integration.title} <br className="hidden sm:inline" /> Presence Today.
                    </h2>
                    <p className="text-indigo-100 text-xl md:text-2xl opacity-90">
                        Join companies automating their customer interactions with Zivox Agent.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Link href="/login">
                            <Button size="lg" className="h-14 px-10 text-xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold shadow-2xl">
                                Build Your AI Agent Free
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button size="lg" variant="outline" className="h-14 px-10 text-xl border-white/30 hover:bg-white/10 text-white font-bold">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center justify-center gap-6 pt-8">
                        <div className="flex items-center gap-2 text-sm text-indigo-100 italic">
                            <Clock className="h-4 w-4" /> Setup in 2 mins
                        </div>
                        <div className="flex items-center gap-2 text-sm text-indigo-100 italic">
                            <ShieldCheck className="h-4 w-4" /> Secure API
                        </div>
                        <div className="flex items-center gap-2 text-sm text-indigo-100 italic">
                            <Zap className="h-4 w-4" /> 24/7 Automation
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
