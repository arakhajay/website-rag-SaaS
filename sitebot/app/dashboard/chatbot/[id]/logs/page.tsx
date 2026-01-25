import { getChatbots } from "@/app/actions/chatbot"
import { ChatbotSwitcher } from "@/components/dashboard/chatbot-switcher"
import { ChatLogsView } from "@/components/dashboard/logs/chat-logs-view"

export default async function ChatbotLogsPage({ params }: { params: Promise<{ id: string }> }) {
    const { chatbots } = await getChatbots()
    const { id: chatbotId } = await params

    const currentChatbot = chatbots?.find(c => String(c.id) === String(chatbotId))
    const chatbotName = currentChatbot?.name || "Chatbot"

    return (
        <div className="h-[calc(100vh-65px)] p-6 bg-slate-50 dark:bg-slate-950">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Chat Logs: {chatbotName}</h1>
                    <p className="text-muted-foreground">View conversation history for this chatbot.</p>
                </div>
                <div>
                    <ChatbotSwitcher chatbots={chatbots || []} currentChatbotId={chatbotId} />
                </div>
            </div>

            <ChatLogsView chatbotId={chatbotId} />
        </div>
    )
}
