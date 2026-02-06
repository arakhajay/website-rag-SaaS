import { getGlobalStats, getRecentSignups } from '@/app/actions/admin-users'
import { getRevenueStats } from '@/app/actions/admin-analytics'
import { StatCard } from '@/components/admin/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Bot,
    MessageSquare,
    DollarSign,
    UserPlus,
    TrendingUp,
    TrendingDown,
    PieChart,
    Wallet
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function AdminOverviewPage() {
    // Fetch all data in parallel
    const [stats, recentSignups, revenueStats] = await Promise.all([
        getGlobalStats(),
        getRecentSignups(5),
        getRevenueStats().catch(() => null) // Gracefully handle if table doesn't exist yet
    ])

    // Format currency
    const formatCurrency = (cents: number) => {
        return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground">
                    Global statistics and system health at a glance.
                </p>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    subtitle={`${stats.activeUsers} active, ${stats.bannedUsers} banned`}
                    icon={Users}
                />
                <StatCard
                    title="Total Chatbots"
                    value={stats.totalChatbots.toLocaleString()}
                    subtitle="Across all users"
                    icon={Bot}
                />
                <StatCard
                    title="Total Messages"
                    value={stats.totalMessages.toLocaleString()}
                    subtitle={`~${(stats.estimatedTokens / 1000).toFixed(0)}K tokens used`}
                    icon={MessageSquare}
                />
                <StatCard
                    title="Est. OpenAI Cost"
                    value={`$${stats.estimatedCost.toFixed(2)}`}
                    subtitle="Based on token estimates"
                    icon={DollarSign}
                />
            </div>

            {/* Revenue Stats */}
            {revenueStats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">MRR</CardTitle>
                            <Wallet className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(revenueStats.mrr)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Monthly Recurring Revenue
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ARR</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(revenueStats.arr)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Annual Recurring Revenue
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(revenueStats.arpu)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Avg Revenue Per User
                            </p>
                        </CardContent>
                    </Card>
                    <Card className={revenueStats.churnRate > 5 ? 'border-red-500/20' : ''}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                            <TrendingDown className={`h-4 w-4 ${revenueStats.churnRate > 5 ? 'text-red-500' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${revenueStats.churnRate > 5 ? 'text-red-500' : ''}`}>
                                {revenueStats.churnRate}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Last 30 days
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Plan Distribution + Secondary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                {/* Plan Distribution Pie Chart */}
                {revenueStats && (
                    <Card className="md:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Plan Distribution</CardTitle>
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { name: 'Free', count: revenueStats.planDistribution.free, color: 'bg-gray-400' },
                                    { name: 'Pro', count: revenueStats.planDistribution.pro, color: 'bg-purple-500' },
                                    { name: 'Enterprise', count: revenueStats.planDistribution.enterprise, color: 'bg-blue-500' }
                                ].map((plan) => (
                                    <div key={plan.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-3 w-3 rounded-full ${plan.color}`} />
                                            <span className="text-sm">{plan.name}</span>
                                        </div>
                                        <Badge variant="secondary">{plan.count}</Badge>
                                    </div>
                                ))}
                            </div>
                            {/* Simple bar chart visualization */}
                            <div className="mt-4 flex h-3 rounded-full overflow-hidden bg-muted">
                                {(() => {
                                    const total = revenueStats.planDistribution.free +
                                        revenueStats.planDistribution.pro +
                                        revenueStats.planDistribution.enterprise || 1
                                    return (
                                        <>
                                            <div
                                                className="bg-gray-400"
                                                style={{ width: `${(revenueStats.planDistribution.free / total) * 100}%` }}
                                            />
                                            <div
                                                className="bg-purple-500"
                                                style={{ width: `${(revenueStats.planDistribution.pro / total) * 100}%` }}
                                            />
                                            <div
                                                className="bg-blue-500"
                                                style={{ width: `${(revenueStats.planDistribution.enterprise / total) * 100}%` }}
                                            />
                                        </>
                                    )
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Secondary Stats */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Captured across all chatbots
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Chatbots/User</CardTitle>
                        <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalUsers > 0
                                ? (stats.totalChatbots / stats.totalUsers).toFixed(1)
                                : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Chatbots per user on average
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Messages/Bot</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalChatbots > 0
                                ? Math.round(stats.totalMessages / stats.totalChatbots)
                                : '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Messages per chatbot on average
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Signups */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-purple-500" />
                        <CardTitle>Recent Signups</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {recentSignups.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No signups yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentSignups.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-medium text-sm">
                                            {user.email?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{user.email}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {user.billing_status || 'free'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

