import { adminGetAllUsers } from '@/app/actions/admin-users'
import { UsersTable } from '@/components/admin/users-table'
import { Users } from 'lucide-react'

interface PageProps {
    searchParams: Promise<{ search?: string; page?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
    const params = await searchParams
    const search = params.search || ''
    const page = parseInt(params.page || '1', 10)

    const { users, total } = await adminGetAllUsers(search, page)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage all users, credits, plans, and access.
                    </p>
                </div>
            </div>

            {/* Users Table */}
            <UsersTable
                initialUsers={users}
                initialTotal={total}
                searchQuery={search}
                currentPage={page}
            />
        </div>
    )
}
