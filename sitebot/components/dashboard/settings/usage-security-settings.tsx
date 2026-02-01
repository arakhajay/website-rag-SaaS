"use client"

import { useState } from "react"
import { ChatbotSettings } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UsageSecuritySettingsProps {
    settings: ChatbotSettings
    onSave: (updatedSettings: ChatbotSettings) => void
}

export function UsageSecuritySettings({ settings, onSave }: UsageSecuritySettingsProps) {
    const [config, setConfig] = useState(settings.usage_security || {})

    const handleConfigChange = (key: keyof typeof config, value: any) => {
        const updatedConfig = { ...config, [key]: value }
        setConfig(updatedConfig)
    }

    const handleSave = () => {
        onSave({ ...settings, usage_security: config })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Adjust the usage limit for your users</h3>
            </div>

            <div className="bg-white dark:bg-slate-950 p-6 rounded-lg border shadow-sm space-y-6">
                <div className="space-y-2">
                    <Label className="text-base font-semibold">Usage limit per user</Label>
                    <p className="text-sm text-muted-foreground">
                        Limit the number of messages per user to avoid misuse.
                    </p>
                    <div className="flex items-center gap-2 max-w-md">
                        <Input
                            type="number"
                            value={config.messages_per_user_limit || ""}
                            onChange={(e) => handleConfigChange("messages_per_user_limit", parseInt(e.target.value))}
                            className="w-24"
                        />
                        <span className="text-sm whitespace-nowrap">Messages per user</span>
                        <Select
                            value={config.limit_unit || "day"}
                            onValueChange={(val) => handleConfigChange("limit_unit", val)}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="per day" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">per day</SelectItem>
                                <SelectItem value="week">per week</SelectItem>
                                <SelectItem value="month">per month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-base font-semibold">User limit warning</Label>
                    <p className="text-sm text-muted-foreground">
                        Set warning message to show when user limit exceeds
                    </p>
                    <Input
                        value={config.limit_warning_message || ""}
                        onChange={(e) => handleConfigChange("limit_warning_message", e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-base font-semibold">Configure Bot rate limit</Label>
                    <p className="text-sm text-muted-foreground">
                        Set API rate limit per minute. Maximum rate limit is 300 per minute.
                    </p>
                    <Input
                        type="number"
                        max={300}
                        value={config.rate_limit || ""}
                        onChange={(e) => handleConfigChange("rate_limit", parseInt(e.target.value))}
                    />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-0.5">
                        <Label className="text-base font-semibold">Access for users with Masked IPs</Label>
                        <p className="text-sm text-muted-foreground">
                            Block users with masked IPs from accessing the chatbot
                        </p>
                    </div>
                    <Switch
                        checked={config.block_masked_ips}
                        onCheckedChange={(checked) => handleConfigChange("block_masked_ips", checked)}
                    />
                </div>
            </div>

            <Button onClick={handleSave}>Save Changes</Button>
        </div>
    )
}
