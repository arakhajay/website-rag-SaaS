import { adminGetAllChatbots } from '@/app/actions/admin-users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Bot, Search, MessageSquare, FileText, Link as LinkIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface PageProps {
    searchParams: Promise<{ search?: string; page?: string }>
}

export default async function AdminChatbotsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const search = params.search || ''
    const page = parseInt(params.page || '1', 10)

    const { chatbots, total } = await adminGetAllChatbots(search, page)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Chatbots</h1>
                    <p className="text-muted-foreground">
                        View and manage all chatbots across the platform.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
                        <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Sources/Bot</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {chatbots.length > 0
                                ? (chatbots.reduce((sum, c) => sum + c.sources_count, 0) / chatbots.length).toFixed(1)
                                : '0'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Messages/Bot</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {chatbots.length > 0
                                ? Math.round(chatbots.reduce((sum, c) => sum + c.messages_count, 0) / chatbots.length)
                                : '0'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <form className="flex items-center gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        name="search"
                        placeholder="Search by name or URL..."
                        defaultValue={search}
                        className="pl-9"
                    />
                </div>
                <Button type="submit" variant="outline">
                    Search
                </Button>
            </form>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Base URL</TableHead>
                            <TableHead>Sources</TableHead>
                            <TableHead>Messages</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {chatbots.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No chatbots found
                                </TableCell>
                            </TableRow>
                        ) : (
                            chatbots.map((chatbot) => (
                                <TableRow key={chatbot.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                <Bot className="h-4 w-4 text-purple-500" />
                                            </div>
                                            <span className="font-medium">{chatbot.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {chatbot.owner_email}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground max-w-[200px] truncate">
                                            <LinkIcon className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">{chatbot.base_url}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {chatbot.sources_count}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {chatbot.messages_count.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDistanceToNow(new Date(chatbot.created_at), { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination info */}
            <p className="text-sm text-muted-foreground">
                Showing {chatbots.length} of {total} chatbots
            </p>
        </div>
    )
}
