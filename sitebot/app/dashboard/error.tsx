'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Dashboard Error]', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Something went wrong</h2>
                <p className="text-muted-foreground max-w-md">
                    We encountered an error loading your dashboard. This is usually temporary.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
            <div className="flex gap-3">
                <Button onClick={reset} variant="default">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                </Button>
                <Button
                    variant="outline"
                    onClick={() => window.location.href = '/login'}
                >
                    Back to Login
                </Button>
            </div>
        </div>
    )
}
