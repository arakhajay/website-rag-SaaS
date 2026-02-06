import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    trend?: {
        value: number
        label: string
        positive?: boolean
    }
    className?: string
}

export function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-purple-500" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {subtitle}
                    </p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <span
                            className={cn(
                                "text-xs font-medium",
                                trend.positive ? "text-green-500" : "text-red-500"
                            )}
                        >
                            {trend.positive ? "+" : ""}{trend.value}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {trend.label}
                        </span>
                    </div>
                )}
            </CardContent>
            {/* Decorative gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-purple-600/50" />
        </Card>
    )
}
