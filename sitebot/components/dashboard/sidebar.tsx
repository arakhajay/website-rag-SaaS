'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Settings,
    MessageSquare,
    Users,
    BarChart3,
    Link as LinkIcon,
    ChevronDown,
    Bot,
    LogOut,
    Share2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    // Extract chatbot ID from URL if present
    // URL patterns: /dashboard/chatbot/[id]/training, /dashboard/chatbot/[id]
    const chatbotIdMatch = pathname.match(/\/dashboard\/chatbot\/([^/]+)/)
    const currentChatbotId = chatbotIdMatch ? chatbotIdMatch[1] : null

    // Build navigation items - some are dynamic based on current chatbot
    const getNavItems = () => {
        const baseItems = [
            { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
        ]

        if (currentChatbotId) {
            // When viewing a specific chatbot, show chatbot-specific routes
            baseItems.push(
                { name: 'Content & Training', href: `/dashboard/chatbot/${currentChatbotId}/training`, icon: FileText },
                { name: 'Bot Settings', href: `/dashboard/chatbot/${currentChatbotId}/settings`, icon: Settings },
                { name: 'Connect', href: `/dashboard/chatbot/${currentChatbotId}/connect`, icon: Share2 },
                { name: 'Leads', href: `/dashboard/chatbot/${currentChatbotId}/leads`, icon: Users },
                { name: 'Chat Logs', href: `/dashboard/chatbot/${currentChatbotId}/logs`, icon: MessageSquare },
                { name: 'Analytics', href: `/dashboard/chatbot/${currentChatbotId}/analytics`, icon: BarChart3 },
            )
        } else {
            // Generic routes when no chatbot is selected - show all tabs consistently
            baseItems.push(
                { name: 'Content & Training', href: '/dashboard/training', icon: FileText },
                { name: 'Bot Settings', href: '/dashboard/settings', icon: Settings },
                { name: 'Connect', href: '/dashboard/connect', icon: Share2 },
                { name: 'Leads', href: '/dashboard/leads', icon: Users },
                { name: 'Chat Logs', href: '/dashboard/logs', icon: MessageSquare },
                { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
            )
        }

        // Always show these
        baseItems.push(
            { name: 'Integrations', href: '/dashboard/integrations', icon: LinkIcon },
        )

        return baseItems
    }

    const navItems = getNavItems()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background">
            {/* Header / Bot Switcher */}
            <div className="p-4 border-b h-16 flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between font-semibold text-lg px-2 hover:bg-muted/50" suppressHydrationWarning>
                            <span className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-primary" />
                                </div>
                                sitebot
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuItem>
                            <span className="font-medium">My Awesome Bot</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-muted-foreground text-xs">
                            + Create new bot
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                        (item.name === 'Content & Training' && pathname.includes('/training'))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                                isActive
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t bg-muted/20">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        CN
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">Company Name</p>
                        <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                    </div>
                </div>
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
