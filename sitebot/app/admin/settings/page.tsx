import { getFeatureFlags } from '@/app/actions/admin-controls'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flag, Settings2, Zap, Lock, Palette, Code, Bot } from 'lucide-react'
import { FeatureFlagsManager } from '@/components/admin/feature-flags-manager'

export default async function AdminSettingsPage() {
    const featureFlags = await getFeatureFlags().catch(() => [])

    const getFlagIcon = (name: string) => {
        if (name.includes('analytics')) return <Zap className="h-4 w-4" />
        if (name.includes('api') || name.includes('code')) return <Code className="h-4 w-4" />
        if (name.includes('branding')) return <Palette className="h-4 w-4" />
        if (name.includes('chatbot') || name.includes('bot')) return <Bot className="h-4 w-4" />
        return <Flag className="h-4 w-4" />
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage feature flags and system-wide settings.
                </p>
            </div>

            {/* Feature Flags Manager */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-purple-500" />
                        <div>
                            <CardTitle>Feature Flags</CardTitle>
                            <CardDescription>
                                Control which features are available to users based on their plan.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <FeatureFlagsManager initialFlags={featureFlags} />
                </CardContent>
            </Card>

            {/* Feature Flags Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Flag className="h-5 w-5 text-purple-500" />
                        <CardTitle>All Feature Flags</CardTitle>
                        <Badge variant="secondary">{featureFlags.length}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {featureFlags.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No feature flags defined yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {featureFlags.map((flag) => (
                                <div
                                    key={flag.id}
                                    className={`p-4 border rounded-lg transition-colors ${flag.is_enabled
                                            ? 'bg-green-500/5 border-green-500/20'
                                            : 'bg-muted/50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {getFlagIcon(flag.name)}
                                            <span className="font-medium text-sm">{flag.name}</span>
                                        </div>
                                        <Badge variant={flag.is_enabled ? 'default' : 'secondary'}>
                                            {flag.is_enabled ? 'ON' : 'OFF'}
                                        </Badge>
                                    </div>
                                    {flag.description && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {flag.description}
                                        </p>
                                    )}
                                    {flag.enabled_plans.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1">
                                            {flag.enabled_plans.map((plan) => (
                                                <Badge key={plan} variant="outline" className="text-xs">
                                                    {plan}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    {flag.percentage < 100 && (
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Rollout: {flag.percentage}%
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* System Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-purple-500" />
                        <CardTitle>System Information</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm font-medium">Environment</p>
                            <p className="text-2xl font-bold text-green-600">
                                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm font-medium">Next.js Version</p>
                            <p className="text-2xl font-bold">14.x</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
