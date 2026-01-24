import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function UsageChart() {
    return (
        <Card className="col-span-1">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Usage</CardTitle>
                <p className="text-sm text-muted-foreground">Monthly messages credits</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="relative h-40 w-40">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background Circle */}
                        <circle
                            className="text-muted/20"
                            strokeWidth="12"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                        {/* Progress Circle (very small slice for 2/10000) */}
                        <circle
                            className="text-primary"
                            strokeWidth="12"
                            strokeDasharray={`${(2 / 100) * 251.2} 251.2`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">0.02%</span>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <span className="text-primary font-bold">2 used</span>
                    <span className="text-muted-foreground"> of 10000 Total</span>
                </div>
            </CardContent>
        </Card>
    )
}
