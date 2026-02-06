'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Bot,
    Activity,
    ArrowLeft,
    ShieldCheck,
    LogOut,
    Megaphone,
    Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Chatbots', href: '/admin/chatbots', icon: Bot },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'System Health', href: '/admin/system', icon: Activity },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background border-purple-500/20">
            {/* Header */}
            <div className="p-4 border-b border-purple-500/20 h-16 flex items-center">
                <div className="flex items-center gap-2 w-full">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                        <span className="font-bold text-lg">Admin</span>
                        <p className="text-xs text-purple-500">Super Admin Mode</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/admin' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-purple-400"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-purple-500/20 space-y-2">
                <Link href="/dashboard">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-destructive"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </Button>
            </div>
        </div>
    )
}
