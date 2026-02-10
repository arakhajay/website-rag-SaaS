import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AutoRedirect } from './auto-redirect'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Sparkles, XCircle } from 'lucide-react'

export default async function SubscriptionSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ plan?: string; status?: string; error?: string }>
}) {
    const params = await searchParams
    const planName = params.plan || 'your plan'
    const status = params.status
    const error = params.error

    const isSuccess = !error && (!status || status === 'active' || status === 'succeeded' || status === 'pending')

    if (!isSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-lg w-full text-center border-2 border-destructive/20 shadow-xl">
                    <CardHeader className="pb-4 pt-10">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <XCircle className="h-10 w-10 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl text-destructive">Payment Failed</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pb-10">
                        <p className="text-muted-foreground">
                            We couldn&apos;t enable your <span className="font-semibold text-foreground capitalize">{planName}</span> plan.
                            <br />
                            {error ? <span className="text-sm text-destructive mt-2 block">{error}</span> : 'The transaction was not completed or was declined.'}
                        </p>

                        <Link href="/dashboard/pricing">
                            <Button size="lg" variant="default" className="w-full shadow-lg mt-2">
                                Try Again
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-lg w-full text-center border-2 border-primary/20 shadow-xl">
                <CardHeader className="pb-4 pt-10">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl">Welcome aboard! 🎉</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pb-10">
                    <p className="text-muted-foreground">
                        Your <span className="font-semibold text-foreground capitalize">{planName}</span> plan is being activated.
                        You have a <span className="font-semibold text-primary">7-day free trial</span> to explore everything.
                    </p>

                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="font-medium">What&apos;s next?</span>
                        </div>
                        <ul className="space-y-1.5 text-sm text-muted-foreground text-left pl-6">
                            <li>• Create your first chatbot</li>
                            <li>• Train it with your website content</li>
                            <li>• Embed it on your site</li>
                            <li>• Start capturing leads</li>
                        </ul>
                    </div>

                    <Link href="/dashboard">
                        <Button size="lg" className="w-full shadow-lg shadow-primary/25 mt-2">
                            Go to Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>

                    <AutoRedirect />
                </CardContent>
            </Card>
        </div>
    )
}
