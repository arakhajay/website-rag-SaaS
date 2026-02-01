import { getChatbots } from "@/app/actions/chatbot"
import { ChatbotSwitcher } from "@/components/dashboard/chatbot-switcher"
import { TrainingManager } from "@/components/dashboard/training/training-manager"
import { ChatInterface } from "@/components/dashboard/chat-interface"

export default async function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
    const { chatbots } = await getChatbots()
    const { id: chatbotId } = await params

    const currentChatbot = chatbots?.find(c => String(c.id) === String(chatbotId))
    const chatbotName = currentChatbot?.name || "Chatbot"

    return (
        <div className="h-[calc(100vh-65px)] p-6 bg-slate-50 dark:bg-slate-950">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Training: {chatbotName}</h1>
                    <p className="text-muted-foreground">Teach your chatbot by adding knowledge sources, guidelines, and workflows.</p>
                </div>
                <div>
                    <ChatbotSwitcher chatbots={chatbots || []} currentChatbotId={chatbotId} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-20">
                {/* Left Pane: Training Manager (Knowledge, Guidelines, Workflows) */}
                <div className="h-full">
                    <TrainingManager chatbotId={chatbotId} />
                </div>

                {/* Right Pane: Live Testing */}
                <div className="h-full">
                    <ChatInterface chatbotId={chatbotId} chatbotName={chatbotName} />
                </div>
            </div>
        </div>
    )
}

