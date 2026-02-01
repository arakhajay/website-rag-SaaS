'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "./general-settings"
import { AppearanceSettings } from "./appearance-settings"
import { MessagingSettings } from "./messaging-settings"
import { StarterQuestionsSettings } from "./starter-questions-settings"
import { EmailSettings } from "./email-settings"
import { UsageSecuritySettings } from "./usage-security-settings"
import { UserFormSettings } from "./user-form-settings"
import { WorkingHoursSettings } from "./working-hours-settings"
import { getChatbotSettings, updateChatbotSettings, type ChatbotSettings } from "@/app/actions/settings"
import { updateChatbot } from "@/app/actions/chatbot"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface SettingsManagerProps {
    chatbotId: string
    initialBotName: string
    chatbots: any[]
}

export function SettingsManager({ chatbotId, initialBotName, chatbots }: SettingsManagerProps) {
    const [settings, setSettings] = useState<ChatbotSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [botName, setBotName] = useState(initialBotName)
    const router = useRouter()

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true)
            const data = await getChatbotSettings(chatbotId)
            if (data) {
                setSettings(data)
                // If appearance widget name is empty, default to bot name
                if (!data.appearance?.widget_name) {
                    setSettings(prev => prev ? ({
                        ...prev,
                        appearance: { ...prev.appearance, widget_name: botName }
                    }) : null)
                }
            }
            setLoading(false)
        }
        fetchSettings()
    }, [chatbotId, botName])

    const handleSave = async (updatedSettings: ChatbotSettings, newBotName?: string) => {
        // Save settings to DB
        // If bot name changed, update chatbots table too
        if (newBotName && newBotName !== botName) {
            await updateChatbot(chatbotId, { name: newBotName })
            setBotName(newBotName)
        }

        const res = await updateChatbotSettings(chatbotId, updatedSettings)
        if (res.success) {
            setSettings(updatedSettings)
            alert("Settings saved successfully!")
        } else {
            alert("Failed to save settings: " + res.error)
        }
    }

    const handleBotSwitch = (newChatbotId: string) => {
        router.push(`/dashboard/chatbot/${newChatbotId}/settings`)
    }

    if (loading || !settings) {
        return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <div className="w-[250px]">
                    <Select value={chatbotId} onValueChange={handleBotSwitch}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a chatbot" />
                        </SelectTrigger>
                        <SelectContent>
                            {chatbots.map((bot) => (
                                <SelectItem key={bot.id} value={bot.id}>
                                    {bot.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <Tabs defaultValue="general" className="w-full flex flex-col md:flex-row gap-6">
                    <aside className="w-full md:w-64 shrink-0">
                        <TabsList className="flex flex-col h-auto bg-transparent p-0 space-y-1 w-full justify-start">
                            <TabsTrigger value="general" className="w-full justify-start px-4 py-2 data-[state=active]:bg-secondary">
                                General
                            </TabsTrigger>
                            <TabsTrigger value="appearance" className="w-full justify-start px-4 py-2 data-[state=active]:bg-secondary">
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger value="messaging" className="w-full justify-start px-4 py-2 data-[state=active]:bg-secondary">
                                Messaging
                            </TabsTrigger>
                            <TabsTrigger value="starter" className="w-full justify-start px-4 py-2 data-[state=active]:bg-secondary">
                                Starter Questions
                            </TabsTrigger>
                            <TabsTrigger value="email" className="w-full justify-start px-4 py-2 data-[state=active]:bg-secondary">
                                Email Setup
                            </TabsTrigger>
                            <TabsTrigger value="usage" className="w-full justify-start px-4 py-2 data-[state=active]:bg-secondary">
                                Usage and security
                            </TabsTrigger>
                            <TabsTrigger value="user_form" className="w-full justify-start px-4 py-2 data-[state=active]:bg-secondary">
                                User form
                            </TabsTrigger>
                            <TabsTrigger value="working_hours" className="w-full justify-start px-4 py-2 data-[state=active]:bg-secondary">
                                Working hours
                            </TabsTrigger>
                        </TabsList>
                    </aside>

                    <div className="flex-1 bg-card rounded-lg border p-6 min-h-[500px]">
                        <TabsContent value="general" className="mt-0">
                            <GeneralSettings
                                settings={settings}
                                botName={botName}
                                onSave={(s, n) => handleSave(s, n)}
                            />
                        </TabsContent>
                        <TabsContent value="appearance" className="mt-0">
                            <AppearanceSettings
                                settings={settings}
                                onSave={(s) => handleSave(s)}
                            />
                        </TabsContent>
                        <TabsContent value="messaging" className="mt-0">
                            <MessagingSettings
                                settings={settings}
                                onSave={(s) => handleSave(s)}
                            />
                        </TabsContent>
                        <TabsContent value="starter" className="mt-0">
                            <StarterQuestionsSettings
                                settings={settings}
                                onSave={(s) => handleSave(s)}
                            />
                        </TabsContent>
                        <TabsContent value="email" className="mt-0">
                            <EmailSettings
                                settings={settings}
                                onSave={(s) => handleSave(s)}
                            />
                        </TabsContent>
                        <TabsContent value="usage" className="mt-0">
                            <UsageSecuritySettings
                                settings={settings}
                                onSave={(s) => handleSave(s)}
                            />
                        </TabsContent>
                        <TabsContent value="user_form" className="mt-0">
                            <UserFormSettings
                                settings={settings}
                                onSave={(s) => handleSave(s)}
                            />
                        </TabsContent>
                        <TabsContent value="working_hours" className="mt-0">
                            <WorkingHoursSettings
                                settings={settings}
                                onSave={(s) => handleSave(s)}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
