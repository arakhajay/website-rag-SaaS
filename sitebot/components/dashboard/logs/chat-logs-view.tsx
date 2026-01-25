'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { getChatSessions, getChatMessages } from '@/app/actions/chat-logs'
import { MessageSquare, Clock, Globe, Monitor, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
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
import { Button } from "@/components/ui/button"
import { clearChatLogs } from '@/app/actions/chat-logs'
import { useRouter } from 'next/navigation'

interface Session {
    id: string
    session_id: string
    source: string
    started_at: string
    updated_at: string
    chat_messages: { count: number }[]
}

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
}

export function ChatLogsView({ chatbotId }: { chatbotId: string }) {
    const [sessions, setSessions] = useState<Session[]>([])
    const [selectedSession, setSelectedSession] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [messagesLoading, setMessagesLoading] = useState(false)
    const router = useRouter()
    const [isClearing, setIsClearing] = useState(false)

    const handleClearLogs = async () => {
        setIsClearing(true)
        await clearChatLogs(chatbotId)
        setSessions([])
        setSelectedSession(null)
        setMessages([])
        setIsClearing(false)
        router.refresh()
    }

    // Fetch sessions on load
    useEffect(() => {
        async function fetchSessions() {
            setLoading(true)
            const data = await getChatSessions(chatbotId)
            setSessions(data as Session[])
            setLoading(false)
        }
        fetchSessions()
    }, [chatbotId])

    // Fetch messages when session selected
    useEffect(() => {
        async function fetchMessages() {
            if (!selectedSession) {
                setMessages([])
                return
            }
            setMessagesLoading(true)
            const data = await getChatMessages(selectedSession)
            setMessages(data as Message[])
            setMessagesLoading(false)
        }
        fetchMessages()
    }, [selectedSession])

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    const getMessageCount = (session: Session) => {
        return session.chat_messages?.[0]?.count || 0
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Sessions List */}
            <Card className="lg:col-span-1 flex flex-col">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Conversations
                        {sessions.length > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                                {sessions.length}
                            </Badge>
                        )}
                        {sessions.length > 0 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 text-muted-foreground hover:text-destructive" disabled={isClearing}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Clear all chat logs?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete all conversation history for this chatbot.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            {isClearing ? 'Clearing...' : 'Clear All'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-full">
                        {loading ? (
                            <div className="p-4 text-center text-muted-foreground">
                                Loading sessions...
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No conversations yet</p>
                                <p className="text-sm mt-1">
                                    Chats will appear here when users interact with your bot.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {sessions.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => setSelectedSession(session.id)}
                                        className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${selectedSession === session.id ? 'bg-muted' : ''
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {session.source === 'widget' ? (
                                                    <Globe className="h-4 w-4 text-blue-500" />
                                                ) : (
                                                    <Monitor className="h-4 w-4 text-green-500" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {session.source === 'widget' ? 'Widget' : 'Dashboard'}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {getMessageCount(session)} msgs
                                            </Badge>
                                        </div>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatTime(session.updated_at)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Messages View */}
            <Card className="lg:col-span-2 flex flex-col">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                        {selectedSession ? 'Conversation' : 'Select a conversation'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        {!selectedSession ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Select a conversation from the list to view messages
                            </div>
                        ) : messagesLoading ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Loading messages...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No messages in this conversation
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-4 py-3 ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                                }`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="text-sm">{msg.content}</p>
                                            )}
                                            <div
                                                className={`text-xs mt-2 ${msg.role === 'user'
                                                    ? 'text-primary-foreground/70'
                                                    : 'text-muted-foreground'
                                                    }`}
                                            >
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
