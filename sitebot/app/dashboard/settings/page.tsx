import { getChatbots } from "@/app/actions/chatbot"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const { chatbots } = await getChatbots()

    if (chatbots && chatbots.length > 0) {
        redirect(`/dashboard/chatbot/${chatbots[0].id}/settings`)
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Bot Settings</h1>
            <p className="text-muted-foreground">Please create a chatbot to configure settings.</p>
        </div>
    )
}
