import { getChatbots } from "@/app/actions/chatbot"
import { redirect } from "next/navigation"

export default async function AnalyticsPage() {
    const { chatbots } = await getChatbots()

    // If no chatbots, show message
    if (!chatbots || chatbots.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Analytics</h1>
                <p className="text-muted-foreground">Create a chatbot first to view analytics.</p>
            </div>
        )
    }

    // Redirect to first chatbot's analytics page
    redirect(`/dashboard/chatbot/${chatbots[0].id}/analytics`)
}
