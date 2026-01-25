'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { getLeads, updateLead, deleteLead, Lead } from '@/app/actions/leads'
import { Users, Mail, Phone, MessageSquare, Clock, Trash2, Edit } from 'lucide-react'

const STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
    { value: 'converted', label: 'Converted', color: 'bg-green-500' },
    { value: 'lost', label: 'Lost', color: 'bg-gray-500' },
]

export function LeadsView({ chatbotId }: { chatbotId: string }) {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [remark, setRemark] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')

    useEffect(() => {
        async function fetchLeads() {
            setLoading(true)
            const data = await getLeads(chatbotId)
            setLeads(data)
            setLoading(false)
        }
        fetchLeads()
    }, [chatbotId])

    const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
        await updateLead(leadId, {
            status: newStatus,
            last_contact_at: newStatus !== 'new' ? new Date().toISOString() : undefined
        })
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    }

    const handleSaveRemark = async () => {
        if (!selectedLead) return
        await updateLead(selectedLead.id, { remark })
        setLeads(leads.map(l => l.id === selectedLead.id ? { ...l, remark } : l))
        setSelectedLead(null)
    }

    const handleDelete = async (leadId: string) => {
        if (!confirm('Are you sure you want to delete this lead?')) return
        await deleteLead(leadId)
        setLeads(leads.filter(l => l.id !== leadId))
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getStatusBadge = (status: string) => {
        const option = STATUS_OPTIONS.find(s => s.value === status)
        return (
            <Badge className={`${option?.color} text-white`}>
                {option?.label || status}
            </Badge>
        )
    }

    const filteredLeads = filterStatus === 'all'
        ? leads
        : leads.filter(l => l.status === filterStatus)

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        converted: leads.filter(l => l.status === 'converted').length,
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs text-muted-foreground">Total Leads</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Mail className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.new}</div>
                            <div className="text-xs text-muted-foreground">New</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.qualified}</div>
                            <div className="text-xs text-muted-foreground">Qualified</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.converted}</div>
                            <div className="text-xs text-muted-foreground">Converted</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Leads Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="text-lg">All Leads</CardTitle>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No leads yet</p>
                            <p className="text-sm">Leads from the contact form will appear here.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Remark</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLeads.map((lead) => (
                                    <TableRow key={lead.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Mail className="h-3 w-3" />
                                                    {lead.email}
                                                </div>
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        {lead.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                                                {lead.message || '—'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={lead.status}
                                                onValueChange={(v) => handleStatusChange(lead.id, v as Lead['status'])}
                                            >
                                                <SelectTrigger className="w-[120px] h-8">
                                                    {getStatusBadge(lead.status)}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedLead(lead)
                                                            setRemark(lead.remark || '')
                                                        }}
                                                    >
                                                        {lead.remark ? (
                                                            <span className="max-w-[100px] truncate text-xs">{lead.remark}</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">Add note</span>
                                                        )}
                                                        <Edit className="h-3 w-3 ml-1" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add Remark</DialogTitle>
                                                    </DialogHeader>
                                                    <Textarea
                                                        value={remark}
                                                        onChange={(e) => setRemark(e.target.value)}
                                                        placeholder="Add follow-up notes..."
                                                        rows={4}
                                                    />
                                                    <Button onClick={handleSaveRemark}>Save</Button>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(lead.created_at)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(lead.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
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
