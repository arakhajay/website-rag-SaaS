import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateBotDialog } from '@/components/dashboard/create-bot-dialog'
import { UsageChart } from '@/components/dashboard/usage-chart'
import { TrainingChart } from '@/components/dashboard/training-chart'
import { SessionChart } from '@/components/dashboard/session-chart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Bot, Link as LinkIcon, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    let {
        data: { user },
    } = await supabase.auth.getUser()

    // Bypassed for testing
    /*
    if (!user) {
        return redirect('/login')
    }
    */

    const { data: chatbots } = await supabase
        .from('chatbots')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <CreateBotDialog />
                </div>
            </div>

            {/* Widgets Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <UsageChart />
                <TrainingChart />
                <SessionChart />
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Your Chatbots</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {chatbots?.map((bot) => (
                        <Link key={bot.id} href={`/dashboard/chatbot/${bot.id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {bot.name}
                                    </CardTitle>
                                    <Bot className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                                        <LinkIcon className="h-4 w-4" />
                                        <span className="truncate">{bot.base_url}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-4">
                                        <Calendar className="h-3 w-3" />
                                        <span>Created {new Date(bot.created_at).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {(!chatbots || chatbots.length === 0) && (
                        <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold">No active chatbots</h3>
                            <p className="text-muted-foreground mb-4">
                                Create a new chatbot to see it listed here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
