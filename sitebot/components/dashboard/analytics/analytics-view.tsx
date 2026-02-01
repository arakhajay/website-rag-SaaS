"use client"

import { useState, useEffect } from "react"
import { AnalyticsRangeSelector } from "./date-range-picker"
import { StatCards } from "./stat-cards"
import { SessionsChart } from "./sessions-chart"
import { AIAnalystCard } from "./ai-analyst-card"
import { getAnalyticsStats, getChartData } from "@/app/actions/analytics"

export function AnalyticsView({ chatbotId }: { chatbotId: string }) {
    const [range, setRange] = useState("7d")
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalMessages: 0,
        totalLeads: 0,
        avgMessages: 0
    })
    const [chartData, setChartData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const [statsData, chartData] = await Promise.all([
                getAnalyticsStats(chatbotId, range),
                getChartData(chatbotId, range)
            ])
            setStats(statsData)
            setChartData(chartData)
            setLoading(false)
        }
        loadData()
    }, [chatbotId, range])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2">Time Range:</span>
                    <AnalyticsRangeSelector range={range} setRange={setRange} />
                </div>
            </div>

            <StatCards stats={stats} />

            <div className="grid gap-6 md:grid-cols-7">
                <div className="md:col-span-4">
                    <SessionsChart data={chartData} />
                </div>
                <div className="md:col-span-3">
                    <AIAnalystCard chatbotId={chatbotId} />
                </div>
            </div>
        </div>
    )
}
