'use client'

import { useState } from 'react'
import { adminDeleteChatbot } from '@/app/actions/admin-users'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteChatbotButtonProps {
    chatbotId: string
    chatbotName: string
}

export function DeleteChatbotButton({ chatbotId, chatbotName }: DeleteChatbotButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        const confirmed = confirm(
            `Are you sure you want to delete "${chatbotName}"?\n\nThis will permanently delete:\n• All training sources\n• All chat sessions & messages\n• All captured leads\n\nThis action cannot be undone.`
        )

        if (!confirmed) return

        setLoading(true)
        try {
            const result = await adminDeleteChatbot(chatbotId)
            if (result.success) {
                router.refresh()
            } else {
                alert(`Failed to delete: ${result.error}`)
            }
        } catch {
            alert('An error occurred while deleting the chatbot.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
