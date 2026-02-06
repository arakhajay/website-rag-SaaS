import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UsageChartProps {
    data: {
        used: number
        limit: number
        percentage: number
    }
}

export function UsageChart({ data }: UsageChartProps) {
    const { used, limit, percentage } = data

    // Calculate stroke dash array for the progress circle
    const circumference = 251.2 // 2 * PI * 40
    const strokeDash = (percentage / 100) * circumference

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
                        {/* Progress Circle */}
                        <circle
                            className="text-primary"
                            strokeWidth="12"
                            strokeDasharray={`${strokeDash} ${circumference}`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{percentage}%</span>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <span className="text-primary font-bold">{used.toLocaleString()} used</span>
                    <span className="text-muted-foreground"> of {limit.toLocaleString()} Total</span>
                </div>
            </CardContent>
        </Card>
    )
}

