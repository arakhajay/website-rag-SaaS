'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { createChatbot } from '@/app/actions/chatbot'

export function CreateBotDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleCreate = async () => {
        if (!name.trim() || !url.trim()) {
            setError('Please fill in all fields')
            return
        }

        try {
            setLoading(true)
            setError('')

            const result = await createChatbot(name, url)

            if (result.success && result.chatbot) {
                setOpen(false)
                setName('')
                setUrl('')
                router.push(`/dashboard/chatbot/${result.chatbot.id}/training`)
                router.refresh()
            } else {
                setError(result.error || 'Failed to create chatbot')
            }
        } catch (error: any) {
            console.error('Error creating bot:', error)
            setError(error.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Chatbot
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Chatbot</DialogTitle>
                    <DialogDescription>
                        Enter a name and the website URL for your chatbot.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="My Awesome Bot"
                            className="col-span-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right">
                            Website
                        </Label>
                        <Input
                            id="url"
                            placeholder="https://example.com"
                            className="col-span-3"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    {error && (
                        <div className="col-span-4 text-sm text-red-500 text-center">
                            {error}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleCreate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Chatbot
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
