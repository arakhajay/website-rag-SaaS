import { getChatbots } from "@/app/actions/chatbot"
import { ChatbotSwitcher } from "@/components/dashboard/chatbot-switcher"
import { AnalyticsView } from "@/components/dashboard/analytics/analytics-view"

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const { chatbots } = await getChatbots()
    const { id: chatbotId } = await params
    const currentChatbot = chatbots?.find(c => String(c.id) === String(chatbotId))

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Analytics: {currentChatbot?.name || 'Chatbot'}</h1>
                    <p className="text-muted-foreground">Insights and performance metrics.</p>
                </div>
                <div>
                    <ChatbotSwitcher chatbots={chatbots || []} currentChatbotId={chatbotId} />
                </div>
            </div>

            <AnalyticsView chatbotId={chatbotId} />
        </div>
    )
}
