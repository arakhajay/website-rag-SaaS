'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import {
    createFeatureFlag,
    toggleFeatureFlag,
    deleteFeatureFlag,
    type FeatureFlag
} from '@/app/actions/admin-controls'
import { useRouter } from 'next/navigation'

interface FeatureFlagsManagerProps {
    initialFlags: FeatureFlag[]
}

export function FeatureFlagsManager({ initialFlags }: FeatureFlagsManagerProps) {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_enabled: false,
        enabled_plans: [] as string[],
        percentage: 100
    })

    const handleCreate = async () => {
        if (!formData.name) return

        setIsLoading(true)
        try {
            const result = await createFeatureFlag({
                name: formData.name.toLowerCase().replace(/\s+/g, '_'),
                description: formData.description,
                is_enabled: formData.is_enabled,
                enabled_plans: formData.enabled_plans,
                percentage: formData.percentage
            })

            if (result.success) {
                setFormData({
                    name: '',
                    description: '',
                    is_enabled: false,
                    enabled_plans: [],
                    percentage: 100
                })
                setIsCreating(false)
                router.refresh()
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggle = async (id: string, currentState: boolean) => {
        setTogglingIds(prev => new Set(prev).add(id))
        try {
            await toggleFeatureFlag(id, !currentState)
            router.refresh()
        } finally {
            setTogglingIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this feature flag?')) return
        await deleteFeatureFlag(id)
        router.refresh()
    }

    const togglePlan = (plan: string) => {
        setFormData(prev => ({
            ...prev,
            enabled_plans: prev.enabled_plans.includes(plan)
                ? prev.enabled_plans.filter(p => p !== plan)
                : [...prev.enabled_plans, plan]
        }))
    }

    return (
        <div className="space-y-4">
            {/* Create New Flag */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                    Toggle features on/off or create new feature flags.
                </p>
                <Button
                    variant={isCreating ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => setIsCreating(!isCreating)}
                >
                    {isCreating ? 'Cancel' : (
                        <>
                            <Plus className="h-4 w-4 mr-2" />
                            New Flag
                        </>
                    )}
                </Button>
            </div>

            {isCreating && (
                <Card className="border-purple-500/20">
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Flag Name</Label>
                                <Input
                                    placeholder="my_new_feature"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use snake_case naming convention
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Rollout Percentage</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={formData.percentage}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        percentage: parseInt(e.target.value) || 100
                                    }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="What does this feature flag control?"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Enabled for Plans</Label>
                            <div className="flex gap-2">
                                {['free', 'pro', 'enterprise'].map((plan) => (
                                    <Badge
                                        key={plan}
                                        variant={formData.enabled_plans.includes(plan) ? 'default' : 'outline'}
                                        className="cursor-pointer capitalize"
                                        onClick={() => togglePlan(plan)}
                                    >
                                        {plan}
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Leave empty to use global is_enabled toggle
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="enabled"
                                    checked={formData.is_enabled}
                                    onCheckedChange={(checked) =>
                                        setFormData(prev => ({ ...prev, is_enabled: checked }))
                                    }
                                />
                                <Label htmlFor="enabled">Enabled by default</Label>
                            </div>

                            <Button onClick={handleCreate} disabled={isLoading || !formData.name}>
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Create Flag
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Toggle List */}
            <div className="space-y-2">
                {initialFlags.map((flag) => (
                    <div
                        key={flag.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={flag.is_enabled}
                                disabled={togglingIds.has(flag.id)}
                                onCheckedChange={() => handleToggle(flag.id, flag.is_enabled)}
                            />
                            <div>
                                <p className="font-medium text-sm">{flag.name}</p>
                                {flag.description && (
                                    <p className="text-xs text-muted-foreground">{flag.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {flag.enabled_plans.map((plan) => (
                                <Badge key={plan} variant="secondary" className="text-xs">
                                    {plan}
                                </Badge>
                            ))}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(flag.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
