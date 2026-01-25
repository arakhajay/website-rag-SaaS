import { getChatbots } from "@/app/actions/chatbot"
import { ChatbotSwitcher } from "@/components/dashboard/chatbot-switcher"
import { SettingsForm } from "@/components/dashboard/settings/settings-form"
import { redirect } from "next/navigation"

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { chatbots } = await getChatbots()
    const { id: chatbotId } = await params

    const currentChatbot = chatbots?.find(c => String(c.id) === String(chatbotId))

    if (!currentChatbot) {
        // Fallback or redirect if ID is invalid
        redirect('/dashboard')
    }

    return (
        <div className="py-6 max-w-3xl mx-auto px-6">
            <div className="flex justify-end mb-4">
                <ChatbotSwitcher chatbots={chatbots || []} currentChatbotId={chatbotId} />
            </div>

            <SettingsForm chatbot={currentChatbot} allChatbots={chatbots || []} />
        </div>
    )
}
