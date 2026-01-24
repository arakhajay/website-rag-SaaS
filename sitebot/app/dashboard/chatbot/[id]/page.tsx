import { createClient } from '@/lib/supabase/server'
import { ChatInterface } from '@/components/dashboard/chat-interface'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function ChatbotPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    let {
        data: { user },
    } = await supabase.auth.getUser()

    // Mock user for bypass mode
    if (!user) {
        user = { id: '50dfebd8-53b6-4e4f-9c77-4e9ec445948c' } as any
    }

    let { data: chatbot } = await supabase
        .from('chatbots')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    // Mock chatbot for bypass mode
    if (!chatbot) {
        chatbot = {
            id: id,
            name: 'Test Bot',
            base_url: 'https://example.com',
            user_id: user.id,
            created_at: new Date().toISOString()
        } as any
    }

    return (
        <div className="py-6 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{chatbot.name}</h1>
                        <p className="text-muted-foreground text-sm">{chatbot.base_url}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/chatbot/${id}/training`}>
                        <Button>Add Training Data</Button>
                    </Link>
                    <Link href={`/dashboard/chatbot/${id}/settings`}>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Stats */}
                <div className="space-y-6">
                    <div className="p-6 border rounded-lg bg-card shadow-sm">
                        <h3 className="font-semibold mb-4">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Messages Today</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">0</p>
                                <p className="text-sm text-muted-foreground">Training Sources</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-card shadow-sm">
                        <h3 className="font-semibold mb-2">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href={`/dashboard/chatbot/${id}/training`} className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    Add Training Data
                                </Button>
                            </Link>
                            <Link href={`/dashboard/chatbot/${id}/settings`} className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    Get Embed Code
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Column: Chat Preview */}
                <div className="border rounded-lg overflow-hidden h-[500px]">
                    <div className="bg-muted px-4 py-2 border-b">
                        <h3 className="font-semibold text-sm">Chat Preview</h3>
                    </div>
                    <ChatInterface chatbotId={chatbot.id} />
                </div>
            </div>
        </div>
    )
}
