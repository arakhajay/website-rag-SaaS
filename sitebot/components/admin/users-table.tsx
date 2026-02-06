'use client'

import { useState } from 'react'
import { AdminUser, adminBanUser, adminChangeUserPlan } from '@/app/actions/admin-users'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditCreditsModal } from './edit-credits-modal'
import {
    MoreHorizontal,
    Search,
    CreditCard,
    Ban,
    CheckCircle,
    ArrowUpCircle,
    Eye,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'

interface UsersTableProps {
    initialUsers: AdminUser[]
    initialTotal: number
    searchQuery?: string
    currentPage: number
}

export function UsersTable({
    initialUsers,
    initialTotal,
    searchQuery = '',
    currentPage,
}: UsersTableProps) {
    const router = useRouter()
    const [users, setUsers] = useState(initialUsers)
    const [total] = useState(initialTotal)
    const [search, setSearch] = useState(searchQuery)
    const [editCreditsUser, setEditCreditsUser] = useState<AdminUser | null>(null)
    const [loadingAction, setLoadingAction] = useState<string | null>(null)

    const perPage = 20
    const totalPages = Math.ceil(total / perPage)

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        params.set('page', '1')
        router.push(`/admin/users?${params.toString()}`)
    }

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        params.set('page', newPage.toString())
        router.push(`/admin/users?${params.toString()}`)
    }

    const handleBan = async (user: AdminUser, banned: boolean) => {
        setLoadingAction(user.id)
        const result = await adminBanUser(user.id, banned)
        if (result.success) {
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, status: banned ? 'banned' : 'active' } : u
            ))
        }
        setLoadingAction(null)
    }

    const handleChangePlan = async (user: AdminUser, plan: 'free' | 'pro' | 'enterprise') => {
        setLoadingAction(user.id)
        const result = await adminChangeUserPlan(user.id, plan)
        if (result.success) {
            const planLimits = {
                free: { message_credits: 10000, training_char_limit: 400000 },
                pro: { message_credits: 100000, training_char_limit: 4000000 },
                enterprise: { message_credits: 1000000, training_char_limit: 40000000 },
            }
            setUsers(users.map(u =>
                u.id === user.id ? {
                    ...u,
                    billing_status: plan,
                    ...planLimits[plan]
                } : u
            ))
        }
        setLoadingAction(null)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'banned': return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'suspended': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'pro': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
            case 'enterprise': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        }
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-9"
                    />
                </div>
                <Button onClick={handleSearch} variant="outline">
                    Search
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Signed Up</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Chatbots</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-medium text-sm">
                                                {user.email?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.email}</p>
                                                {user.role === 'super_admin' && (
                                                    <Badge variant="outline" className="text-xs">Admin</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize ${getPlanColor(user.billing_status)}`}>
                                            {user.billing_status || 'free'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.message_credits.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{user.chatbots_count}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {loadingAction === user.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setEditCreditsUser(user)}>
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Edit Credits
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <ArrowUpCircle className="mr-2 h-4 w-4" />
                                                            Change Plan
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem onClick={() => handleChangePlan(user, 'free')}>
                                                                Free
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleChangePlan(user, 'pro')}>
                                                                Pro
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleChangePlan(user, 'enterprise')}>
                                                                Enterprise
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSeparator />
                                                    {user.status === 'banned' ? (
                                                        <DropdownMenuItem onClick={() => handleBan(user, false)}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Unban User
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onClick={() => handleBan(user, true)}
                                                            className="text-destructive"
                                                        >
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            Ban User
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem disabled>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View As (Coming Soon)
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, total)} of {total} users
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit Credits Modal */}
            <EditCreditsModal
                open={!!editCreditsUser}
                onOpenChange={(open) => !open && setEditCreditsUser(null)}
                user={editCreditsUser}
                onSuccess={() => router.refresh()}
            />
        </div>
    )
}
