'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ImpersonationBannerProps {
    userEmail: string
    onExit?: () => void
}

export function ImpersonationBanner({ userEmail, onExit }: ImpersonationBannerProps) {
    const router = useRouter()

    const handleExit = () => {
        // Clear impersonation cookie
        document.cookie = 'impersonate_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        onExit?.()
        router.push('/admin/users')
        router.refresh()
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
                <span className="font-semibold">⚠️ Viewing as:</span>
                <span>{userEmail}</span>
            </div>
            <Button
                size="sm"
                variant="outline"
                className="bg-yellow-600 border-yellow-700 text-white hover:bg-yellow-700"
                onClick={handleExit}
            >
                <X className="h-4 w-4 mr-1" />
                Exit Impersonation
            </Button>
        </div>
    )
}
