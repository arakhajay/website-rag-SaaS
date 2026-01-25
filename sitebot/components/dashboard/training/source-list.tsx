'use client'

import { useEffect, useState } from "react"
import { getTrainingSources, deleteTrainingSource } from "@/app/actions/chatbot"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SourceList({ chatbotId, refreshTrigger }: { chatbotId: string, refreshTrigger: number }) {
    const [sources, setSources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSources = async () => {
        setLoading(true)
        const res = await getTrainingSources(chatbotId)
        if (res.success) {
            setSources(res.sources)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSources()
        // Poll for updates every 5 seconds to show status changes
        const interval = setInterval(fetchSources, 5000)
        return () => clearInterval(interval)
    }, [chatbotId, refreshTrigger])

    const handleDelete = async (id: string) => {
        await deleteTrainingSource(id)
        fetchSources()
    }

    if (loading && sources.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Loading sources...</div>
    }

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground mb-2">Active Sources ({sources.length})</h3>

            {sources.length === 0 && (
                <div className="text-sm text-muted-foreground italic border border-dashed rounded-lg p-8 text-center bg-muted/20">
                    No knowledge sources added yet.
                </div>
            )}

            {sources.map(source => (
                <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase">{source.source_type}</Badge>
                            <span className="font-medium text-sm truncate block">{source.source_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {source.chunks_count > 0 ? (
                                <><CheckCircle className="h-3 w-3 text-green-500" /> Indexed ({source.chunks_count} chunks)</>
                            ) : (
                                <><Loader2 className="h-3 w-3 animate-spin text-amber-500" /> Indexing...</>
                            )}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(source.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
