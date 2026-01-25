import { getChatbots } from "@/app/actions/chatbot"
import { LeadsView } from "@/components/dashboard/leads/leads-view"
import { LeadChatbotSelector } from "@/components/dashboard/leads/lead-chatbot-selector"

export default async function LeadsPage({
    searchParams
}: {
    searchParams: Promise<{ chatbot?: string }>
}) {
    const { chatbots } = await getChatbots()
    const params = await searchParams

    // If no chatbots, show message
    if (!chatbots || chatbots.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Leads</h1>
                <p className="text-muted-foreground">Create a chatbot first to view leads.</p>
            </div>
        )
    }

    // Get current chatbot from query param or default to first
    const currentChatbotId = params.chatbot || chatbots[0].id
    const currentChatbot = chatbots.find(c => c.id === currentChatbotId) || chatbots[0]

    return (
        <div className="h-[calc(100vh-65px)] p-6 bg-slate-50 dark:bg-slate-950 overflow-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Leads: {currentChatbot.name}</h1>
                    <p className="text-muted-foreground">Manage leads captured from the contact form.</p>
                </div>
                <LeadChatbotSelector chatbots={chatbots} currentChatbotId={currentChatbot.id} />
            </div>

            <LeadsView chatbotId={currentChatbot.id} />
        </div>
    )
}
