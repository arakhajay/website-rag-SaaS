'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChatbotSettings } from "@/app/actions/settings"

interface GeneralSettingsProps {
    settings: ChatbotSettings
    botName: string
    onSave: (settings: ChatbotSettings, botName: string) => void
}

export function GeneralSettings({ settings, botName, onSave }: GeneralSettingsProps) {
    const [name, setName] = useState(botName)
    const [description, setDescription] = useState(settings.general?.description || "")

    const handleSave = () => {
        onSave({
            ...settings,
            general: {
                ...settings.general,
                description
            }
        }, name)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-1">Configure your bot according to your needs</h2>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="bot-name" className="text-base font-medium">Bot name</Label>
                    <p className="text-sm text-muted-foreground">Give your bot a friendly name. Only for internal reference.</p>
                    <Input
                        id="bot-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Chatbot"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bot-desc" className="text-base font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">Bot description for internal references</p>
                    <Input
                        id="bot-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Internal description..."
                    />
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </div>
        </div>
    )
}
