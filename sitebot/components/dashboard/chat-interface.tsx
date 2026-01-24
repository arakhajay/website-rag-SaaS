'use client'

import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Send } from 'lucide-react'

export function ChatInterface({ chatbotId }: { chatbotId: string }) {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
        body: { chatbotId },
    } as any) as any

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>Test Chatbot</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    {messages.map((m: any) => (
                        <div
                            key={m.id}
                            className={`mb-4 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            <div
                                className={`rounded-lg px-4 py-2 max-w-[80%] ${m.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                    }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground mt-20">
                            Type a message to start chatting with your data.
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask something..."
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
