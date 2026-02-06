import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SessionData {
    date: string
    label: string
    sessions: number
}

interface SessionChartProps {
    data: SessionData[]
}

export function SessionChart({ data }: SessionChartProps) {
    // Find max for scaling
    const maxSessions = Math.max(...data.map(d => d.sessions), 1)

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Daily Chat Sessions (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full flex items-end justify-between gap-2 px-2">
                    {data.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                            <div
                                className="w-full bg-primary/20 rounded-t-sm transition-all group-hover:bg-primary/40 relative min-h-[4px]"
                                style={{ height: `${Math.max((day.sessions / maxSessions) * 100, 2)}%` }}
                            >
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    {day.sessions}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">{day.label}</div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

