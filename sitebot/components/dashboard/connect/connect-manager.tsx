"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmbedSection } from "./embed-section"
import { ApiSection } from "./api-section"

interface ConnectManagerProps {
    chatbotId: string
}

export function ConnectManager({ chatbotId }: ConnectManagerProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Connect</h2>
                <p className="text-muted-foreground">Integrate your chatbot with your website or apps.</p>
            </div>

            <Tabs defaultValue="embed" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="embed">Embed on your website</TabsTrigger>
                    <TabsTrigger value="api">REST API</TabsTrigger>
                </TabsList>
                <TabsContent value="embed" className="mt-6">
                    <EmbedSection chatbotId={chatbotId} />
                </TabsContent>
                <TabsContent value="api" className="mt-6">
                    <ApiSection chatbotId={chatbotId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
