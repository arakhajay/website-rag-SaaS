'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Check, ChevronsUpDown, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

type Chatbot = {
    id: string
    name: string
    base_url: string
}

export function ChatbotSwitcher({
    chatbots,
    currentChatbotId
}: {
    chatbots: Chatbot[]
    currentChatbotId: string
}) {
    const router = useRouter()
    const pathname = usePathname()

    // Match current tab
    // e.g. /dashboard/chatbot/[id]/training -> training
    // e.g. /dashboard/chatbot/[id]/settings -> settings
    const currentTab = pathname?.split('/').pop() || 'training'
    // Ensure we only redirect to known valid tabs
    const targetTab = ['training', 'settings', 'logs', 'analytics'].includes(currentTab) ? currentTab : 'training'

    // DEBUG: Log IDs to help troubleshoot
    console.log('Switcher Current ID:', currentChatbotId)
    // console.log('Available Bots:', chatbots.map(c => c.id))

    // Ensure we match even if there are subtle differences
    const currentChatbot = chatbots.find(c => String(c.id) === String(currentChatbotId))

    const handleSelect = (chatbotId: string) => {
        router.push(`/dashboard/chatbot/${chatbotId}/${targetTab}`)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between">
                    <div className="flex items-center truncate">
                        <Bot className="mr-2 h-4 w-4 opacity-50" />
                        <span className="truncate">{currentChatbot?.name || "Select Chatbot"}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
                <DropdownMenuLabel>Switch Chatbot</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {chatbots.map((chatbot) => (
                    <DropdownMenuItem
                        key={chatbot.id}
                        onSelect={() => handleSelect(chatbot.id)}
                    >
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                currentChatbotId === chatbot.id ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {chatbot.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
