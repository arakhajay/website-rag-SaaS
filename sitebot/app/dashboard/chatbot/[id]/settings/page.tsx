import { redirect } from "next/navigation"
import { getChatbot, getChatbots } from "@/app/actions/chatbot"
import { SettingsManager } from "@/components/dashboard/settings/settings-manager"

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: chatbotId } = await params
    const [chatbotRes, chatbotsRes] = await Promise.all([
        getChatbot(chatbotId),
        getChatbots()
    ])

    const chatbot = chatbotRes.chatbot
    const chatbots = chatbotsRes.chatbots

    if (!chatbot) {
        redirect('/dashboard')
    }

    return (
        <div className="h-[calc(100vh-65px)] p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            <SettingsManager
                chatbotId={chatbotId}
                initialBotName={chatbot.name}
                chatbots={chatbots}
            />
        </div>
    )
}
