import { getChatbots } from "@/app/actions/chatbot"
import { redirect } from "next/navigation"

export default async function LogsPage() {
    const { chatbots } = await getChatbots()

    if (chatbots && chatbots.length > 0) {
        redirect(`/dashboard/chatbot/${chatbots[0].id}/logs`)
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Chat Logs</h1>
            <p className="text-muted-foreground">Please create a chatbot to view logs.</p>
        </div>
    )
}
