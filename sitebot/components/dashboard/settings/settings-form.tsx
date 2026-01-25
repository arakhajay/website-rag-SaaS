'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Copy, Check, Trash2, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
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
import { updateChatbot, deleteChatbot } from '@/app/actions/chatbot'
import { toast } from "sonner" // Assuming sonner is installed, if not we'll use simple alerts or add it. Shadcn usually recommends it.

// Simple toast fallback if not present (although standard shadcn setup usually implies one)
const showToast = (message: string) => {
    // In a real app we'd use a proper toast library
    console.log("Toast:", message)
    // alert(message) // Too intrusive
}

export function SettingsForm({ chatbot, allChatbots }: { chatbot: any, allChatbots: any[] }) {
    const router = useRouter()
    const [botName, setBotName] = useState(chatbot.name)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [copied, setCopied] = useState(false)

    // Embed code generation
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const embedCode = `<script
  src="${origin}/widget.bundle.js"
  data-chatbot-id="${chatbot.id}"
></script>`

    const handleCopy = async () => {
        await navigator.clipboard.writeText(embedCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await updateChatbot(chatbot.id, { name: botName })
            if (res.success) {
                showToast("Chatbot updated successfully")
                router.refresh()
            } else {
                showToast("Failed to update chatbot")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const res = await deleteChatbot(chatbot.id)
            if (res.success) {
                // Find another bot to switch to
                const nextBot = allChatbots.find(b => b.id !== chatbot.id)

                if (nextBot) {
                    // Hard redirect to avoid stale state hang
                    window.location.href = `/dashboard/chatbot/${nextBot.id}/training`
                } else {
                    window.location.href = '/dashboard'
                }
            } else {
                console.error(res.error)
                showToast("Failed to delete chatbot: " + res.error)
                setDeleting(false)
            }
        } catch (error) {
            console.error('Delete failed:', error)
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="mb-6 flex items-center gap-4">
                <Link href={`/dashboard/chatbot/${chatbot.id}/training`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bot Settings</h1>
                    <p className="text-muted-foreground text-sm">Configure your chatbot settings.</p>
                </div>
            </div>

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
                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
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
                        <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto whitespace-pre-wrap font-mono break-all">
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
                                    chatbot <strong>{chatbot.name}</strong> and remove all training data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handleDelete()
                                    }}
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
    )
}
