"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"

interface EmbedSectionProps {
    chatbotId: string
}

export function EmbedSection({ chatbotId }: EmbedSectionProps) {
    const [copied, setCopied] = useState(false)
    const [scriptSrc, setScriptSrc] = useState('/widget.bundle.js')

    // Set the full URL on client side after hydration
    useEffect(() => {
        setScriptSrc(`${window.location.origin}/widget.bundle.js`)
    }, [])

    const embedCode = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = "${scriptSrc}";
    script.setAttribute('data-chatbot-id', "${chatbotId}");
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`

    const handleCopy = () => {
        navigator.clipboard.writeText(embedCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Embed on your website</CardTitle>
                    <CardDescription>
                        Copy and paste the code snippet below into your HTML code where you want to display the chatbot.
                        Usually this goes before the closing <code>&lt;/body&gt;</code> tag.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative rounded-md bg-muted p-4">
                        <pre className="overflow-x-auto text-sm">
                            <code>{embedCode}</code>
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
