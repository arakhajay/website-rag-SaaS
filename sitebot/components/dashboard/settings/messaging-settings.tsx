'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ChatbotSettings } from "@/app/actions/settings"
import { Sparkles } from "lucide-react"

const CHAT_MODELS = [
    {
        id: 'gemini-2.0-flash',
        label: 'Gemini 2.0 Flash',
        provider: 'google',
        description: 'Fast & ultra-cheap',
        costTier: 'low' as const,
    },
    {
        id: 'gemini-2.5-flash',
        label: 'Gemini 2.5 Flash',
        provider: 'google',
        description: 'Latest — smart & cheap',
        costTier: 'low' as const,
    },
    {
        id: 'gpt-4o-mini',
        label: 'GPT-4o Mini',
        provider: 'openai',
        description: 'Affordable OpenAI',
        costTier: 'medium' as const,
    },
    {
        id: 'gpt-4.1-mini',
        label: 'GPT-4.1 Mini',
        provider: 'openai',
        description: 'Latest compact OpenAI',
        costTier: 'medium' as const,
    },
    {
        id: 'gpt-4o',
        label: 'GPT-4o',
        provider: 'openai',
        description: 'Most capable',
        costTier: 'high' as const,
    },
]



function CostBadge({ tier }: { tier: 'low' | 'medium' | 'high' }) {
    const config = {
        low: { label: '$', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        medium: { label: '$$', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
        high: { label: '$$$', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    }
    const c = config[tier]
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${c.color}`}>
            {c.label}
        </span>
    )
}

function ProviderBadge({ provider }: { provider: string }) {
    if (provider === 'google') {
        return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">Gemini</span>
    }
    return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30">OpenAI</span>
}

interface MessagingSettingsProps {
    settings: ChatbotSettings
    onSave: (settings: ChatbotSettings) => void
}

export function MessagingSettings({ settings, onSave }: MessagingSettingsProps) {
    const [messaging, setMessaging] = useState(settings.messaging || {})

    const handleChange = (key: keyof typeof messaging, value: any) => {
        setMessaging(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = () => {
        onSave({
            ...settings,
            messaging
        })
    }

    const selectedModel = CHAT_MODELS.find(m => m.id === (messaging.model || 'gemini-2.0-flash'))

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-1">Customize behavior and message settings</h2>
            </div>

            <div className="space-y-6">
                {/* AI Chat Model */}
                <div className="space-y-3 p-4 rounded-xl border bg-card/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <Label className="text-sm font-semibold">AI Chat Model</Label>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-1">Select which AI model powers your chatbot responses</p>
                    <Select value={messaging.model || 'gemini-2.0-flash'} onValueChange={(val) => handleChange('model', val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select model">
                                {selectedModel && (
                                    <div className="flex items-center gap-2">
                                        <span>{selectedModel.label}</span>
                                        <CostBadge tier={selectedModel.costTier} />
                                    </div>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {CHAT_MODELS.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                    <div className="flex items-center gap-2 w-full">
                                        <span className="font-medium">{model.label}</span>
                                        <ProviderBadge provider={model.provider} />
                                        <CostBadge tier={model.costTier} />
                                        <span className="text-xs text-muted-foreground ml-auto">{model.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>



                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">Strict FAQ Responses <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-full">New</span></Label>
                        <p className="text-xs text-muted-foreground">Limit responses to exact FAQ content only.</p>
                    </div>
                    <Switch
                        checked={messaging.strict_faq || false}
                        onCheckedChange={(checked) => handleChange('strict_faq', checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Response Length</Label>
                        <p className="text-xs text-muted-foreground">Select the response length of your bot</p>
                    </div>
                    <Select value={messaging.response_length || 'medium'} onValueChange={(val) => handleChange('response_length', val)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Medium" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Show sources with the response</Label>
                        <p className="text-xs text-muted-foreground">Hide/Show sources along with responses</p>
                    </div>
                    <Switch
                        checked={messaging.show_sources !== false} // default true
                        onCheckedChange={(checked) => handleChange('show_sources', checked)}
                    />
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Welcome Message</Label>
                            <p className="text-xs text-muted-foreground">First message shown to users</p>
                        </div>
                        <Switch
                            checked={messaging.show_floating_welcome_message !== false}
                            onCheckedChange={(checked) => handleChange('show_floating_welcome_message', checked)}
                        />
                    </div>
                    <Input
                        value={messaging.welcome_message || ''}
                        onChange={(e) => handleChange('welcome_message', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Message shown when no Source is added</Label>
                    <Input
                        value={messaging.no_source_message || ''}
                        onChange={(e) => handleChange('no_source_message', e.target.value)}
                    />
                </div>

                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        </div>
    )
}
