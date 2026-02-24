'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    MessageCircle,
    Hash,
    Send,
    Zap,
    Globe,
    Gamepad2,
    Facebook,
    ShoppingBag,
    Users,
    Settings,
    Check,
    Copy,
    RefreshCw,
    ExternalLink,
    ArrowRight,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react'
import {
    PLATFORMS,
    type Integration,
    type IntegrationPlatform,
    type PlatformInfo,
} from '@/lib/integrations'
import {
    getAllUserIntegrations,
    upsertIntegration,
    toggleIntegration,
    deleteIntegration,
    regenerateApiKey,
} from '@/app/actions/integrations'
import { getChatbots } from '@/app/actions/chatbot'

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
    whatsapp: <MessageCircle className="h-6 w-6" />,
    slack: <Hash className="h-6 w-6" />,
    telegram: <Send className="h-6 w-6" />,
    zapier: <Zap className="h-6 w-6" />,
    wordpress: <Globe className="h-6 w-6" />,
    discord: <Gamepad2 className="h-6 w-6" />,
    messenger: <Facebook className="h-6 w-6" />,
    shopify: <ShoppingBag className="h-6 w-6" />,
    hubspot: <Users className="h-6 w-6" />,
}

const PLATFORM_COLORS: Record<string, string> = {
    whatsapp: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-500',
    slack: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-500',
    telegram: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-500',
    zapier: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-500',
    wordpress: 'from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-500',
    discord: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-500',
    messenger: 'from-blue-600/20 to-blue-700/10 border-blue-600/30 text-blue-600',
    shopify: 'from-lime-500/20 to-lime-600/10 border-lime-500/30 text-lime-500',
    hubspot: 'from-orange-600/20 to-orange-700/10 border-orange-600/30 text-orange-600',
}

const PLATFORM_BG: Record<string, string> = {
    whatsapp: 'bg-green-500/10',
    slack: 'bg-purple-500/10',
    telegram: 'bg-blue-500/10',
    zapier: 'bg-orange-500/10',
    wordpress: 'bg-sky-500/10',
    discord: 'bg-indigo-500/10',
    messenger: 'bg-blue-600/10',
    shopify: 'bg-lime-500/10',
    hubspot: 'bg-orange-600/10',
}

const CATEGORY_LABELS: Record<string, string> = {
    messaging: '💬 Messaging',
    workspace: '🏢 Workspace',
    automation: '🔄 Automation',
    ecommerce: '🛒 E-Commerce',
    crm: '📧 CRM',
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformInfo | null>(null)
    const [configValues, setConfigValues] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [selectedChatbot, setSelectedChatbot] = useState<string>('')
    const [chatbots, setChatbots] = useState<{ id: string; name: string }[]>([])
    const [filter, setFilter] = useState<'all' | 'connected' | 'messaging' | 'workspace'>('all')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [intResult, chatbotResult] = await Promise.all([
                getAllUserIntegrations(),
                getChatbots(),
            ])
            setIntegrations(intResult.integrations)
            if (chatbotResult.chatbots) {
                setChatbots(chatbotResult.chatbots.map((b: any) => ({ id: b.id, name: b.name })))
            }
        } catch (err) {
            console.error('Failed to load integrations:', err)
        } finally {
            setLoading(false)
        }
    }

    function getIntegrationForPlatform(platformId: string): Integration | undefined {
        return integrations.find(i => i.platform === platformId)
    }

    async function handleSave() {
        if (!selectedPlatform || !selectedChatbot) return
        setSaving(true)
        try {
            const result = await upsertIntegration(
                selectedChatbot,
                selectedPlatform.id,
                configValues,
                true
            )
            if (result.error) {
                console.error(result.error)
            } else {
                await loadData()
                setSelectedPlatform(null)
                setConfigValues({})
            }
        } catch (err) {
            console.error('Failed to save:', err)
        } finally {
            setSaving(false)
        }
    }

    async function handleToggle(integration: Integration) {
        await toggleIntegration(integration.id, !integration.enabled)
        await loadData()
    }

    async function handleDisconnect(integration: Integration) {
        await deleteIntegration(integration.id)
        await loadData()
    }

    async function handleRegenerateKey(integration: Integration) {
        const result = await regenerateApiKey(integration.id)
        if (!result.error) {
            await loadData()
        }
    }

    function copyToClipboard(text: string, field: string) {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    function openConfigDialog(platform: PlatformInfo) {
        if (platform.status === 'coming_soon') return
        setSelectedPlatform(platform)
        // Pre-populate config if integration exists
        const existing = getIntegrationForPlatform(platform.id)
        if (existing) {
            setConfigValues(existing.config as Record<string, string>)
            setSelectedChatbot(existing.chatbot_id)
        } else {
            setConfigValues({})
            setSelectedChatbot(chatbots[0]?.id || '')
        }
    }

    // Group platforms by category
    const categories = PLATFORMS.reduce((acc, platform) => {
        if (!acc[platform.category]) acc[platform.category] = []
        acc[platform.category].push(platform)
        return acc
    }, {} as Record<string, PlatformInfo[]>)

    const filteredPlatforms = PLATFORMS.filter(p => {
        if (filter === 'connected') return getIntegrationForPlatform(p.id)?.enabled
        if (filter === 'messaging') return p.category === 'messaging'
        if (filter === 'workspace') return ['workspace', 'automation', 'ecommerce', 'crm'].includes(p.category)
        return true
    })

    const connectedCount = integrations.filter(i => i.enabled).length
    const totalMessages = integrations.reduce((sum, i) => sum + i.message_count, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                    <p className="text-muted-foreground mt-1">
                        Connect your chatbot to external platforms and reach your customers everywhere.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium">{connectedCount} Connected</span>
                    </div>
                    {totalMessages > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border">
                            <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{totalMessages.toLocaleString()} messages</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`p-4 rounded-xl border text-left transition-all ${filter === 'all' ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/30'}`}
                >
                    <p className="text-2xl font-bold">{PLATFORMS.length}</p>
                    <p className="text-sm text-muted-foreground">All Platforms</p>
                </button>
                <button
                    onClick={() => setFilter('connected')}
                    className={`p-4 rounded-xl border text-left transition-all ${filter === 'connected' ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/30'}`}
                >
                    <p className="text-2xl font-bold">{connectedCount}</p>
                    <p className="text-sm text-muted-foreground">Active Connections</p>
                </button>
                <button
                    onClick={() => setFilter('messaging')}
                    className={`p-4 rounded-xl border text-left transition-all ${filter === 'messaging' ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/30'}`}
                >
                    <p className="text-2xl font-bold">{PLATFORMS.filter(p => p.category === 'messaging').length}</p>
                    <p className="text-sm text-muted-foreground">💬 Messaging</p>
                </button>
                <button
                    onClick={() => setFilter('workspace')}
                    className={`p-4 rounded-xl border text-left transition-all ${filter === 'workspace' ? 'border-primary bg-primary/5 shadow-sm' : 'hover:border-primary/30'}`}
                >
                    <p className="text-2xl font-bold">{PLATFORMS.filter(p => ['workspace', 'automation', 'ecommerce', 'crm'].includes(p.category)).length}</p>
                    <p className="text-sm text-muted-foreground">🔧 Tools & CRM</p>
                </button>
            </div>

            {/* Integration Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlatforms.map((platform) => {
                    const integration = getIntegrationForPlatform(platform.id)
                    const isConnected = integration?.enabled
                    const isComingSoon = platform.status === 'coming_soon'
                    const colorClass = PLATFORM_COLORS[platform.id] || ''
                    const bgClass = PLATFORM_BG[platform.id] || ''

                    return (
                        <Card
                            key={platform.id}
                            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                                isComingSoon ? 'opacity-60' : 'cursor-pointer hover:scale-[1.02]'
                            } ${isConnected ? 'ring-2 ring-green-500/30' : ''}`}
                            onClick={() => !isComingSoon && openConfigDialog(platform)}
                        >
                            {/* Gradient background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${colorClass.split(' ').slice(0, 2).join(' ')} opacity-50`} />

                            <CardContent className="relative p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${bgClass}`}>
                                        <div className={colorClass.split(' ').pop()}>
                                            {PLATFORM_ICONS[platform.id]}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isConnected && (
                                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                                                <Check className="h-3 w-3 mr-1" /> Connected
                                            </Badge>
                                        )}
                                        {isComingSoon && (
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                                Coming Soon
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold mb-1">{platform.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {platform.description}
                                </p>

                                {integration && (
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                        <span>{integration.message_count} messages</span>
                                        {integration.last_message_at && (
                                            <span>Last: {new Date(integration.last_message_at).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    {isConnected ? (
                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <Switch
                                                checked={integration?.enabled || false}
                                                onCheckedChange={() => integration && handleToggle(integration)}
                                            />
                                            <span className="text-sm text-muted-foreground">Active</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            {CATEGORY_LABELS[platform.category]}
                                        </span>
                                    )}

                                    {!isComingSoon && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="group-hover:bg-primary/10"
                                        >
                                            {isConnected ? (
                                                <>
                                                    <Settings className="h-4 w-4 mr-1" />
                                                    Configure
                                                </>
                                            ) : (
                                                <>
                                                    Connect
                                                    <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Configuration Dialog */}
            <Dialog open={!!selectedPlatform} onOpenChange={() => { setSelectedPlatform(null); setConfigValues({}); }}>
                <DialogContent className="sm:max-w-lg">
                    {selectedPlatform && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-lg ${PLATFORM_BG[selectedPlatform.id]}`}>
                                        <div className={PLATFORM_COLORS[selectedPlatform.id]?.split(' ').pop()}>
                                            {PLATFORM_ICONS[selectedPlatform.id]}
                                        </div>
                                    </div>
                                    <div>
                                        <DialogTitle>Configure {selectedPlatform.name}</DialogTitle>
                                        <DialogDescription>
                                            {selectedPlatform.description}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {/* Chatbot Selector */}
                                <div className="space-y-2">
                                    <Label>Chatbot</Label>
                                    <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a chatbot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {chatbots.map(bot => (
                                                <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Platform-specific config fields */}
                                {selectedPlatform.configFields.map(field => (
                                    <div key={field.key} className="space-y-2">
                                        <Label htmlFor={field.key}>
                                            {field.label}
                                            {field.required && <span className="text-destructive ml-1">*</span>}
                                        </Label>
                                        {field.type === 'select' ? (
                                            <Select
                                                value={configValues[field.key] || ''}
                                                onValueChange={(val) => setConfigValues(prev => ({ ...prev, [field.key]: val }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {field.options?.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="relative">
                                                <Input
                                                    id={field.key}
                                                    type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                                                    placeholder={field.placeholder}
                                                    value={configValues[field.key] || ''}
                                                    onChange={(e) => setConfigValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                />
                                                {field.type === 'password' && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                                        onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                                                    >
                                                        {showPasswords[field.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        {field.helpText && (
                                            <p className="text-xs text-muted-foreground">{field.helpText}</p>
                                        )}
                                    </div>
                                ))}

                                {/* Zapier-specific: Show API key and webhook URL */}
                                {selectedPlatform.id === 'zapier' && (
                                    <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
                                        <div>
                                            <Label className="text-xs uppercase text-muted-foreground">Your API Key</Label>
                                            <p className="text-xs text-muted-foreground mb-2">Use this key to authenticate Zapier requests</p>
                                            {(() => {
                                                const existing = getIntegrationForPlatform('zapier')
                                                return existing?.api_key ? (
                                                    <div className="flex items-center gap-2">
                                                        <code className="flex-1 px-3 py-2 rounded bg-background border text-xs font-mono truncate">
                                                            {existing.api_key}
                                                        </code>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(existing.api_key!, 'api_key')}
                                                        >
                                                            {copiedField === 'api_key' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRegenerateKey(existing)}
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">API key will be generated when you save</p>
                                                )
                                            })()}
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase text-muted-foreground">Webhook URL</Label>
                                            <p className="text-xs text-muted-foreground mb-2">Add this URL as a webhook in your Zapier Zap</p>
                                            {(() => {
                                                const existing = getIntegrationForPlatform('zapier')
                                                return existing?.webhook_url ? (
                                                    <div className="flex items-center gap-2">
                                                        <code className="flex-1 px-3 py-2 rounded bg-background border text-xs font-mono truncate">
                                                            {existing.webhook_url}
                                                        </code>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => copyToClipboard(existing.webhook_url!, 'webhook_url')}
                                                        >
                                                            {copiedField === 'webhook_url' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">Webhook URL will be generated when you save</p>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* WordPress-specific: Download plugin */}
                                {selectedPlatform.id === 'wordpress' && (
                                    <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                                        <h4 className="font-medium text-sm">WordPress Plugin</h4>
                                        <p className="text-xs text-muted-foreground">
                                            Download and install the Zivox Agent WordPress plugin. It will automatically add
                                            your chatbot widget to every page on your WordPress site.
                                        </p>
                                        <Button variant="outline" size="sm" disabled>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Download Plugin (Coming Soon)
                                        </Button>
                                    </div>
                                )}

                                {/* Existing integration actions */}
                                {getIntegrationForPlatform(selectedPlatform.id) && (
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="text-sm text-muted-foreground">Disconnect this integration?</span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                const existing = getIntegrationForPlatform(selectedPlatform.id)
                                                if (existing) {
                                                    handleDisconnect(existing)
                                                    setSelectedPlatform(null)
                                                }
                                            }}
                                        >
                                            Disconnect
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setSelectedPlatform(null); setConfigValues({}); }}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !selectedChatbot}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        getIntegrationForPlatform(selectedPlatform.id) ? 'Update' : 'Connect'
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
