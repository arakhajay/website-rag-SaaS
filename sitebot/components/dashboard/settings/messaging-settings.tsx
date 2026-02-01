'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ChatbotSettings } from "@/app/actions/settings"

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

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-1">Customize behavior and message settings</h2>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>AI Model</Label>
                        <p className="text-xs text-muted-foreground">Select a model to power your bot</p>
                    </div>
                    <Select value={messaging.model || 'gpt-4o-mini'} onValueChange={(val) => handleChange('model', val)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                            <SelectItem value="gpt-4o">gpt-4o</SelectItem>
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
