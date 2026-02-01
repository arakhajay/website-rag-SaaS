"use client"

import { useState } from "react"
import { ChatbotSettings } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WorkingHoursSettingsProps {
    settings: ChatbotSettings
    onSave: (updatedSettings: ChatbotSettings) => void
}

export function WorkingHoursSettings({ settings, onSave }: WorkingHoursSettingsProps) {
    const [config, setConfig] = useState(settings.working_hours || {})

    const handleConfigChange = (key: keyof typeof config, value: any) => {
        const updatedConfig = { ...config, [key]: value }
        setConfig(updatedConfig)
    }

    const handleScheduleUpdate = (index: number, key: string, value: any) => {
        const currentSchedule = [...(config.schedule || [])]
        // @ts-ignore
        currentSchedule[index][key] = value
        handleConfigChange("schedule", currentSchedule)
    }

    const handleSave = () => {
        onSave({ ...settings, working_hours: config })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Working hours</h3>
                <p className="text-sm text-muted-foreground">
                    Give your customers a better idea of when to expect support by setting working hours.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-6 rounded-lg border shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base font-semibold">Enable working hours</Label>
                        <p className="text-sm text-muted-foreground">Only show chatbot during specific times</p>
                    </div>
                    <Switch
                        checked={config.enabled}
                        onCheckedChange={(checked) => handleConfigChange("enabled", checked)}
                    />
                </div>

                {config.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select
                                value={config.timezone || "UTC"}
                                onValueChange={(val) => handleConfigChange("timezone", val)}
                            >
                                <SelectTrigger className="w-full max-w-xs">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                                    <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                                    <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                                    <SelectItem value="Europe/London">London</SelectItem>
                                    <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                                    {/* Add more timezones as needed */}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            {(config.schedule || []).map((day, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-24 font-medium">{day.day}</div>
                                    <Switch
                                        checked={day.enabled}
                                        onCheckedChange={(checked) => handleScheduleUpdate(index, "enabled", checked)}
                                    />
                                    {day.enabled ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={day.start}
                                                onChange={(e) => handleScheduleUpdate(index, "start", e.target.value)}
                                                className="w-32"
                                            />
                                            <span>to</span>
                                            <Input
                                                type="time"
                                                value={day.end}
                                                onChange={(e) => handleScheduleUpdate(index, "end", e.target.value)}
                                                className="w-32"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground text-sm italic">Closed</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Button onClick={handleSave}>Save Changes</Button>
        </div>
    )
}
