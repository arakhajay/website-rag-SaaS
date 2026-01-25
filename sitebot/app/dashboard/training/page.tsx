import { getChatbots } from "@/app/actions/chatbot"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataSourcesManager } from "@/components/dashboard/training/data-sources-manager"
import { ChatInterface } from "@/components/dashboard/chat-interface"
import { ChatbotSwitcher } from "@/components/dashboard/chatbot-switcher"

export default async function TrainingPage({ params }: { params: { id: string } }) {
    const { chatbots } = await getChatbots()
    const chatbotId = params.id

    // Security check: Ensure the user owns this bot (or is admin)
    // The RLS in Supabase handles fetching, so if it's not in the list, access is denied (or it doesn't exist)
    const currentChatbot = chatbots?.find(c => c.id === chatbotId)

    if (!currentChatbot) {
        // If ID is valid but not found in list, user might not own it. 
        // Or if generic "training" page redirected here but something failed.
        // For now, if no bots, show empty state.
        if (!chatbots || chatbots.length === 0) {
            return (
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Content & Training</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle>No Chatbots Found</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Please create a chatbot first to manage its training data.</p>
                        </CardContent>
                    </Card>
                </div>
            )
        }
        // If bots exist but ID is wrong, redirect to first bot
        redirect(`/dashboard/chatbot/${chatbots[0].id}/training`)
    }

    return (
        <div className="h-[calc(100vh-65px)] p-6 bg-slate-50 dark:bg-slate-950">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Content & Training</h1>
                    <p className="text-muted-foreground">Teach your chatbot by adding knowledge sources and testing immediately.</p>
                </div>
                <div>
                    <ChatbotSwitcher chatbots={chatbots} currentChatbotId={chatbotId} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full pb-20">
                {/* Left Pane: Data Ingestion */}
                <div className="h-full">
                    <DataSourcesManager chatbotId={chatbotId} />
                </div>

                {/* Right Pane: Live Testing */}
                <div className="h-full">
                    <ChatInterface chatbotId={chatbotId} />
                </div>
            </div>
        </div>
    )
}
