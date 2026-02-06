import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { ShieldCheck } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6 md:p-10 max-w-7xl">
                    {/* Admin Mode Banner */}
                    <div className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-2.5 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <ShieldCheck className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                            <span className="text-sm text-purple-500 font-semibold">
                                Admin Mode Active
                            </span>
                            <p className="text-xs text-muted-foreground">
                                You have full access to manage all users, chatbots, and system settings.
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    )
}
