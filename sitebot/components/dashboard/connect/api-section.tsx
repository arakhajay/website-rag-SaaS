"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"

interface ApiSectionProps {
    chatbotId: string
}

export function ApiSection({ chatbotId }: ApiSectionProps) {
    const [copiedEndpoint, setCopiedEndpoint] = useState(false)
    const [copiedToken, setCopiedToken] = useState(false)

    const apiEndpoint = typeof window !== 'undefined' ? `${window.location.origin}/api/chat` : '/api/chat'

    const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>REST API Integration</CardTitle>
                    <CardDescription>
                        Use our REST API to interact with your chatbot programmatically.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">API Endpoint</label>
                        <div className="flex gap-2">
                            <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm">{apiEndpoint}</code>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleCopy(apiEndpoint, setCopiedEndpoint)}
                            >
                                {copiedEndpoint ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Chatbot ID (Required in body)</label>
                        <div className="flex gap-2">
                            <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm">{chatbotId}</code>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleCopy(chatbotId, setCopiedToken)}
                            >
                                {copiedToken ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Example Request</label>
                        <div className="relative rounded-md bg-muted p-4">
                            <pre className="overflow-x-auto text-sm text-muted-foreground">
                                {`curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatbotId": "${chatbotId}",
    "messages": [{"role": "user", "content": "Hello"}],
    "sessionId": "optional-session-id"
  }'`}
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
