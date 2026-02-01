'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns'
import { updateLeadStatus } from '@/app/actions/leads'
import { toast } from 'sonner' // Assuming sonner is used, or console log if not

interface Lead {
    id: string
    name?: string
    email: string
    phone?: string
    message?: string
    source: string
    created_at: string
    status: string
    custom_data?: any
}

function StatusSelect({ leadId, currentStatus }: { leadId: string, currentStatus: string }) {
    const [status, setStatus] = useState(currentStatus)

    const handleValueChange = async (val: string) => {
        // Optimistic update
        setStatus(val)

        const result = await updateLeadStatus(leadId, val)
        if (!result.success) {
            // Revert if failed
            setStatus(currentStatus)
            console.error('Failed to update status')
        }
    }

    return (
        <Select value={status} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[130px] h-8">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
        </Select>
    )
}

export default function LeadsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: chatbotId } = use(params)
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchLeads() {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('chatbot_id', chatbotId)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setLeads(data)
            }
            setLoading(false)
        }

        fetchLeads()
    }, [chatbotId])

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
                    <p className="text-muted-foreground">Manage leads captured by your chatbot</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Captured Leads</CardTitle>
                    <CardDescription>
                        List of users who submitted their contact details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            Loading leads...
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
                            <span className="text-4xl">📭</span>
                            <p>No leads captured yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Mobile No</TableHead>
                                    <TableHead className="w-[300px]">Message</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.map((lead) => (
                                    <TableRow key={lead.id}>
                                        <TableCell className="font-medium">{lead.name || '-'}</TableCell>
                                        <TableCell>{lead.email}</TableCell>
                                        <TableCell>{lead.phone || '-'}</TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={lead.message}>
                                            {lead.message || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{lead.source}</Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                                            {format(new Date(lead.created_at), 'MMM d, yyyy h:mm a')}
                                        </TableCell>
                                        <TableCell>
                                            <StatusSelect leadId={lead.id} currentStatus={lead.status || 'new'} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
