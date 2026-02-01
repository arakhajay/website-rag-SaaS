"use client"

import { useState } from "react"
import { generateAIAnalysis } from "@/app/actions/ai-analyst"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Recommendation {
    title: string
    action: string
    priority: 'High' | 'Medium' | 'Low'
}

interface AnalysisData {
    summary: string
    trends: string[]
    recommendations: Recommendation[]
}

export function AIAnalystCard({ chatbotId }: { chatbotId: string }) {
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        const result = await generateAIAnalysis(chatbotId)
        if (result.success && result.data) {
            setAnalysis(result.data)
        }
        setLoading(false)
    }

    return (
        <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                            <Sparkles className="h-5 w-5" />
                            AI Data Analyst
                        </CardTitle>
                        <CardDescription>
                            Get intelligent insights and actionable recommendations.
                        </CardDescription>
                    </div>

                    {!analysis && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Generate Insights
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Generate AI Analysis?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will analyze your data using GPT-4o.
                                        <br /><br />
                                        <strong>Cost:</strong> 1 Message Credit will be deducted from your quota.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700">
                                        Continue & Generate
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="py-8 text-center text-indigo-500 flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Analyzing usage patterns...</p>
                    </div>
                ) : analysis ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        {/* Summary */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm">
                            <p className="text-sm font-medium leading-relaxed">
                                {analysis.summary}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Trends */}
                            <div>
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-indigo-600">
                                    <TrendingUp className="h-4 w-4" /> Key Trends
                                </h4>
                                <ul className="space-y-2">
                                    {analysis.trends.map((trend, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                                            {trend}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Recommendations */}
                            <div>
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-indigo-600">
                                    <Lightbulb className="h-4 w-4" /> Recommendations
                                </h4>
                                <div className="space-y-3">
                                    {analysis.recommendations.map((rec, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-900 p-3 rounded-lg border text-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{rec.title}</span>
                                                <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                                                    {rec.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">{rec.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="ghost" className="text-xs text-muted-foreground" onClick={() => setAnalysis(null)}>
                                Close Report
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading} className="ml-2">
                                Refresh Analysis
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-indigo-100 dark:border-indigo-900/50 rounded-lg">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 text-indigo-200" />
                        <p>No analysis generated yet.</p>
                        <p className="text-xs">Click the button above to discover insights.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
