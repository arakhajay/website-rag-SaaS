'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Copy, Check, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function BotSettingsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const supabase = createClient()

    const [copied, setCopied] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [botName, setBotName] = useState('My Bot')

    const embedCode = `<script
  src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/widget.bundle.js"
  data-chatbot-id="${id}"
></script>`

    const handleCopy = async () => {
        await navigator.clipboard.writeText(embedCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            // Delete from Supabase (will fail in mock mode but that's ok)
            await supabase.from('chatbots').delete().eq('id', id)

            // TODO: Also delete vectors from Pinecone

            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            console.error('Delete failed:', error)
            // Still redirect in mock mode
            router.push('/dashboard')
        }
    }

    return (
        <div className="py-6 max-w-3xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link href={`/dashboard/chatbot/${id}/training`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bot Settings</h1>
                    <p className="text-muted-foreground text-sm">Configure your chatbot settings.</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>General</CardTitle>
                        <CardDescription>Basic chatbot configuration.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bot-name">Bot Name</Label>
                            <Input
                                id="bot-name"
                                value={botName}
                                onChange={(e) => setBotName(e.target.value)}
                                placeholder="My Awesome Bot"
                            />
                        </div>
                        <Button>Save Changes</Button>
                    </CardContent>
                </Card>

                {/* Embed Code */}
                <Card>
                    <CardHeader>
                        <CardTitle>Embed Code</CardTitle>
                        <CardDescription>
                            Add this script to your website&apos;s &lt;body&gt; tag to display the chatbot widget.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                                {embedCode}
                            </pre>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2"
                                onClick={handleCopy}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            The widget will appear as a floating chat button on your website.
                        </p>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                            Irreversible actions. Please be careful.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Chatbot
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your
                                        chatbot and remove all training data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {deleting ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 mr-2" />
                                        )}
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
