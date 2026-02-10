import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function SubscriptionCancelPage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-lg w-full text-center shadow-xl">
                <CardHeader className="pb-4 pt-10">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <XCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl">Checkout Cancelled</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pb-10">
                    <p className="text-muted-foreground">
                        No worries! Your checkout was cancelled and you haven&apos;t been charged.
                        You can choose a plan whenever you&apos;re ready.
                    </p>

                    <Link href="/dashboard/pricing">
                        <Button size="lg" variant="outline" className="w-full mt-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Plans
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
