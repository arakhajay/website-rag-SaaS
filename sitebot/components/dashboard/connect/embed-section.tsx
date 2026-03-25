"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface EmbedSectionProps {
    chatbotId: string
    chatbots?: any[]
}

export function EmbedSection({ chatbotId, chatbots = [] }: EmbedSectionProps) {
    const [copied, setCopied] = useState(false)
    const [baseUrl, setBaseUrl] = useState('')
    const [embedType, setEmbedType] = useState('script')
    const [selectedChatbotId, setSelectedChatbotId] = useState(chatbotId)

    // Set the full URL on client side after hydration
    useEffect(() => {
        setBaseUrl(window.location.origin)
    }, [])

    const snippets: Record<string, string> = {
        script: `<script>\n  (function() {\n    var script = document.createElement('script');\n    script.src = "${baseUrl}/widget.bundle.js";\n    script.setAttribute('data-chatbot-id', "${selectedChatbotId}");\n    script.setAttribute('data-base-url', "${baseUrl}");\n    script.async = true;\n    document.body.appendChild(script);\n  })();\n</script>`,
        iframe: `<iframe\n  src="${baseUrl}/chat/${selectedChatbotId}"\n  width="100%"\n  height="600px"\n  frameBorder="0"\n  style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"\n></iframe>`,
        react: `// Example React / Next.js Component\n"use client";\nimport { useEffect } from 'react';\n\nexport default function ChatbotRoot() {\n  useEffect(() => {\n    const script = document.createElement('script');\n    script.src = "${baseUrl}/widget.bundle.js";\n    script.setAttribute('data-chatbot-id', "${selectedChatbotId}");\n    script.setAttribute('data-base-url', "${baseUrl}");\n    script.async = true;\n    document.body.appendChild(script);\n  }, []);\n\n  return null;\n}`
    }

    const currentSnippet = snippets[embedType] || snippets.script

    const handleCopy = () => {
        navigator.clipboard.writeText(currentSnippet)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Embed on your website</CardTitle>
                    <CardDescription>
                        Copy and paste the code snippet below into your application where you want to display the chatbot.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {chatbots && chatbots.length > 0 && (
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="chatbot-select">Select Chatbot</Label>
                            <Select value={selectedChatbotId} onValueChange={setSelectedChatbotId}>
                                <SelectTrigger id="chatbot-select" className="w-[300px]">
                                    <SelectValue placeholder="Select a chatbot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {chatbots.map(bot => (
                                        <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="embed-type">Integration Method</Label>
                        <Select value={embedType} onValueChange={setEmbedType}>
                            <SelectTrigger id="embed-type" className="w-[250px]">
                                <SelectValue placeholder="Select integration type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="script">HTML &lt;script&gt; (Standard)</SelectItem>
                                <SelectItem value="iframe">HTML &lt;iframe&gt; (Page Inline)</SelectItem>
                                <SelectItem value="react">React Component (Next.js/CRA)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="relative rounded-md bg-muted p-4">
                        <pre className="overflow-x-auto text-sm text-foreground">
                            <code>{currentSnippet}</code>
                        </pre>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-2 h-8 w-8"
                            onClick={handleCopy}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Manage allowed hosts</CardTitle>
                    <CardDescription>
                        To prevent other websites from using your chatbot, you can restrict which domains are allowed to load it.
                        (Coming soon)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" disabled>Manage allowed hosts</Button>
                </CardContent>
            </Card>
        </div>
    )
}
