'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export function ChatInterface({ chatbotId, chatbotName }: { chatbotId: string, chatbotName?: string }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatbotId,
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`API Error: ${response.status} - ${errorText}`)
            }

            const reader = response.body?.getReader()
            if (!reader) throw new Error('No response body')

            const decoder = new TextDecoder()
            let assistantContent = ''

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: ''
            }
            setMessages(prev => [...prev, assistantMessage])

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                assistantContent += chunk

                setMessages(prev => prev.map(m =>
                    m.id === assistantMessage.id
                        ? { ...m, content: assistantContent }
                        : m
                ))
            }

        } catch (err: any) {
            console.error('[ChatInterface] Error:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">{chatbotName ? `Test ${chatbotName}` : "Test Chatbot"}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden px-4">
                <ScrollArea className="h-full pr-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`rounded-lg px-4 py-3 max-w-[85%] ${m.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'}`}
                                >
                                    {m.role === 'assistant' ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    // Style tables
                                                    table: ({ children }) => (
                                                        <table className="border-collapse border border-slate-300 my-2 text-sm">
                                                            {children}
                                                        </table>
                                                    ),
                                                    th: ({ children }) => (
                                                        <th className="border border-slate-300 px-2 py-1 bg-slate-100 dark:bg-slate-800 font-semibold text-left">
                                                            {children}
                                                        </th>
                                                    ),
                                                    td: ({ children }) => (
                                                        <td className="border border-slate-300 px-2 py-1">
                                                            {children}
                                                        </td>
                                                    ),
                                                    // Style lists
                                                    ul: ({ children }) => (
                                                        <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>
                                                    ),
                                                    li: ({ children }) => (
                                                        <li className="text-sm">{children}</li>
                                                    ),
                                                    // Style headings
                                                    h1: ({ children }) => (
                                                        <h1 className="text-lg font-bold mt-3 mb-2">{children}</h1>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>
                                                    ),
                                                    // Style paragraphs
                                                    p: ({ children }) => (
                                                        <p className="text-sm leading-relaxed my-1">{children}</p>
                                                    ),
                                                    // Style code
                                                    code: ({ children }) => (
                                                        <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">
                                                            {children}
                                                        </code>
                                                    ),
                                                    // Style bold/strong
                                                    strong: ({ children }) => (
                                                        <strong className="font-semibold">{children}</strong>
                                                    ),
                                                }}
                                            >
                                                {m.content || (isLoading ? '...' : '')}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-sm">{m.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-20">
                                Type a message to start chatting with your data.
                            </div>
                        )}
                        {error && (
                            <div className="text-center text-red-500 mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                                ⚠️ {error}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="pt-3">
                <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask something..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading} size="icon">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
