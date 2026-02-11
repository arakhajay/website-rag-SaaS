import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Puzzle } from "lucide-react"

export default function IntegrationsPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2">Integrations</h1>
                <p className="text-muted-foreground">Connect your chatbot to other services.</p>
            </div>

            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                        <Puzzle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Integrations Coming Soon</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            We're working on connecting Zivox Agent with your favorite tools.
                            Expect seamless integrations with Slack, Discord, Zapier, and more.
                        </p>
                    </div>
                    <Badge variant="secondary" className="mt-4">
                        Work in Progress
                    </Badge>
                </CardContent>
            </Card>
        </div>
    )
}
