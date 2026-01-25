'use client'

import { useRouter } from 'next/navigation'
import { Bot } from 'lucide-react'

interface Chatbot {
    id: string
    name: string
}

export function LeadChatbotSelector({
    chatbots,
    currentChatbotId
}: {
    chatbots: Chatbot[]
    currentChatbotId: string
}) {
    const router = useRouter()

    return (
        <div className="relative">
            <select
                className="appearance-none bg-white border rounded-md px-4 py-2 pr-10 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-black dark:bg-slate-950 dark:border-slate-800"
                defaultValue={currentChatbotId}
                onChange={(e) => {
                    router.push(`/dashboard/leads?chatbot=${e.target.value}`)
                }}
            >
                {chatbots.map((bot) => (
                    <option key={bot.id} value={bot.id}>
                        {bot.name}
                    </option>
                ))}
            </select>
            <Bot className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
    )
}
