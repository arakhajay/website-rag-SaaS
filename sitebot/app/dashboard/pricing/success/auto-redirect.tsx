'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function AutoRedirect({ delayMs = 3000, targetUrl = '/dashboard' }: { delayMs?: number, targetUrl?: string }) {
    const router = useRouter()
    const [timeLeft, setTimeLeft] = useState(delayMs / 1000)

    useEffect(() => {
        if (timeLeft <= 0) {
            router.push(targetUrl)
            return
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, router, targetUrl])

    return (
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">
            Redirecting to dashboard in {timeLeft} seconds...
        </p>
    )
}
