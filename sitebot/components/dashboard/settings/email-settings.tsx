"use client"

import { useState } from "react"
import { ChatbotSettings } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"

interface EmailSettingsProps {
    settings: ChatbotSettings
    onSave: (updatedSettings: ChatbotSettings) => void
}

export function EmailSettings({ settings, onSave }: EmailSettingsProps) {
    const [config, setConfig] = useState(settings.email_config || {})
    const [newEmail, setNewEmail] = useState("")

    const handleConfigChange = (key: keyof typeof config, value: any) => {
        const updatedConfig = { ...config, [key]: value }
        setConfig(updatedConfig)
    }

    const handleAddEmail = () => {
        if (!newEmail) return
        const currentList = config.additional_emails || []
        const updatedList = [...currentList, newEmail]
        handleConfigChange("additional_emails", updatedList)
        setNewEmail("")
    }

    const handleRemoveEmail = (index: number) => {
        const currentList = config.additional_emails || []
        const updatedList = currentList.filter((_, i) => i !== index)
        handleConfigChange("additional_emails", updatedList)
    }

    const handleSave = () => {
        onSave({ ...settings, email_config: config })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Set up email for transcript and support purposes</h3>
                <p className="text-sm text-muted-foreground">
                    Configure how you want to handle email communications.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <CardTitle className="text-base">Send Email Transcript</CardTitle>
                            <CardDescription>
                                If enabled, we email users their respective chat transcript after the chat has ended
                            </CardDescription>
                        </div>
                        <Switch
                            checked={config.send_email_transcript}
                            onCheckedChange={(checked) => handleConfigChange("send_email_transcript", checked)}
                        />
                    </div>
                </CardHeader>
            </Card>

            <div className="bg-white dark:bg-slate-950 p-6 rounded-lg border shadow-sm space-y-4">
                <div className="space-y-2">
                    <Label className="text-base font-semibold">Main customer support email address</Label>
                    <p className="text-sm text-muted-foreground">General email address for any case</p>
                    <Input
                        value={config.support_email || ""}
                        onChange={(e) => handleConfigChange("support_email", e.target.value)}
                        placeholder="support@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-base font-semibold">Add Support emails</Label>
                    <p className="text-sm text-muted-foreground">Automatically redirect specific issues to relevant emails</p>

                    <div className="space-y-2">
                        {(config.additional_emails || []).map((email, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input value={email} readOnly className="bg-slate-50" />
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveEmail(index)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Input
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="sales@example.com"
                        />
                        <Button variant="outline" onClick={handleAddEmail}>
                            <Plus className="h-4 w-4 mr-2" /> Add new
                        </Button>
                    </div>
                </div>
            </div>

            <Button onClick={handleSave}>Save Changes</Button>
        </div>
    )
}
