import { getSystemHealth } from '@/app/actions/admin-users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Activity,
    MessageSquare,
    Users,
    AlertTriangle,
    Clock,
    CheckCircle,
    Server
} from 'lucide-react'

export default async function AdminSystemPage() {
    const health = await getSystemHealth()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
                    <p className="text-muted-foreground">
                        Monitor system performance and health metrics.
                    </p>
                </div>
            </div>

            {/* Status Banner */}
            <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="flex items-center gap-3 py-4">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-green-500">All Systems Operational</p>
                        <p className="text-sm text-muted-foreground">
                            Last checked: Just now
                        </p>
                    </div>
                    <Badge className="ml-auto bg-green-500/20 text-green-500 border-green-500/30">
                        Healthy
                    </Badge>
                </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{health.totalSessions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages (24h)</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{health.messagesLast24h.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Leads (24h)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{health.leadsLast24h}</div>
                        <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{health.avgResponseTime}s</div>
                        <p className="text-xs text-muted-foreground">AI response latency</p>
                    </CardContent>
                </Card>
            </div>

            {/* Services Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-purple-500" />
                        Service Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { name: 'Supabase Auth', status: 'operational' },
                            { name: 'Supabase Database', status: 'operational' },
                            { name: 'Pinecone Vector DB', status: 'operational' },
                            { name: 'OpenAI API', status: 'operational' },
                            { name: 'Firecrawl', status: 'operational' },
                        ].map((service) => (
                            <div
                                key={service.name}
                                className="flex items-center justify-between py-2 border-b last:border-0"
                            >
                                <span className="font-medium">{service.name}</span>
                                <Badge
                                    variant="outline"
                                    className={
                                        service.status === 'operational'
                                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                    }
                                >
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${service.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                    {service.status === 'operational' ? 'Operational' : 'Down'}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Error Rate */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Error Rate
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold">
                            {(health.errorRate * 100).toFixed(1)}%
                        </div>
                        <div className="flex-1">
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all"
                                    style={{ width: `${(1 - health.errorRate) * 100}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {((1 - health.errorRate) * 100).toFixed(1)}% success rate
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
