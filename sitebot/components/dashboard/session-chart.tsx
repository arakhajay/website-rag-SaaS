import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SessionChart() {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Daily Chat Sessions (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full flex items-end justify-between gap-2 px-2">
                    {[0, 0, 0, 0, 0, 2, 8].map((val, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                            <div
                                className="w-full bg-primary/20 rounded-t-sm transition-all group-hover:bg-primary/40 relative"
                                style={{ height: `${val * 10}%` }}
                            >
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    {val}
                                </span>
                            </div>
                            <div className="h-px w-full bg-border" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
