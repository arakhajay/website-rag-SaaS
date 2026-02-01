"use client"

import { useState } from "react"
import { ChatbotSettings } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, GripVertical, Plus } from "lucide-react"

interface UserFormSettingsProps {
    settings: ChatbotSettings
    onSave: (updatedSettings: ChatbotSettings) => void
}

export function UserFormSettings({ settings, onSave }: UserFormSettingsProps) {
    const [config, setConfig] = useState(settings.user_form || {})

    const handleConfigChange = (key: keyof typeof config, value: any) => {
        const updatedConfig = { ...config, [key]: value }
        setConfig(updatedConfig)
    }

    const handleAddField = () => {
        const currentFields = config.fields || []
        const newField = {
            id: `field_${Date.now()}`,
            type: 'text',
            label: 'New Field',
            required: false
        }
        // @ts-ignore
        handleConfigChange("fields", [...currentFields, newField])
    }

    const handleRemoveField = (index: number) => {
        const currentFields = config.fields || []
        const updatedFields = currentFields.filter((_, i) => i !== index)
        handleConfigChange("fields", updatedFields)
    }

    const handleFieldUpdate = (index: number, key: string, value: any) => {
        const currentFields = [...(config.fields || [])]
        // @ts-ignore
        currentFields[index][key] = value
        handleConfigChange("fields", currentFields)
    }

    const handleSave = () => {
        onSave({ ...settings, user_form: config })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Choose what data to collect from your users before they chat</h3>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-base">Enable user form</CardTitle>
                            <CardDescription>Enable or disable user form</CardDescription>
                        </div>
                        <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => handleConfigChange("enabled", checked)}
                        />
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-base">Enable Captcha</CardTitle>
                            <CardDescription>Prevent automated spam and fraudulent activities</CardDescription>
                        </div>
                        <Switch
                            checked={config.captcha_enabled}
                            onCheckedChange={(checked) => handleConfigChange("captcha_enabled", checked)}
                        />
                    </CardHeader>
                </Card>
            </div>

            {config.enabled && (
                <div className="space-y-4">
                    <h4 className="font-semibold">Form</h4>
                    <p className="text-sm text-muted-foreground">Build your form here</p>

                    <div className="space-y-3">
                        {(config.fields || []).map((field, index) => (
                            <div key={index} className="flex items-end gap-3 p-4 bg-white dark:bg-slate-950 border rounded-lg shadow-sm">
                                <GripVertical className="h-5 w-5 text-muted-foreground mb-3 cursor-move" />

                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs text-muted-foreground">Field type</Label>
                                    <Select
                                        value={field.type}
                                        onValueChange={(val) => handleFieldUpdate(index, "type", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="email">Email</SelectItem>
                                            <SelectItem value="phone">Phone</SelectItem>
                                            <SelectItem value="textarea">Long Text</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-[2] space-y-2">
                                    <Label className="text-xs text-muted-foreground">Field label</Label>
                                    <Input
                                        value={field.label}
                                        onChange={(e) => handleFieldUpdate(index, "label", e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                    <Checkbox
                                        checked={field.required}
                                        onCheckedChange={(checked) => handleFieldUpdate(index, "required", checked)}
                                    />
                                    <Label className="text-sm">Required</Label>
                                </div>

                                <Button variant="ghost" size="icon" className="mb-1" onClick={() => handleRemoveField(index)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Button variant="outline" onClick={handleAddField} className="w-full border-dashed">
                        <Plus className="h-4 w-4 mr-2" /> Add new
                    </Button>
                </div>
            )}

            <Button onClick={handleSave}>Save Changes</Button>
        </div>
    )
}
