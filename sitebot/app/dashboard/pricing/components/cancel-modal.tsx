'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { cancelSubscription } from '@/app/actions/subscription'
import { useRouter } from 'next/navigation'

interface CancelSubscriptionModalProps {
    onCancelSuccess: (subscription?: any) => void
}

export function CancelSubscriptionModal({ onCancelSuccess }: CancelSubscriptionModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState('')
    const router = useRouter()

    const handleCancel = async () => {
        if (!feedback.trim()) {
            alert('Please provide some feedback before cancelling.')
            return
        }

        setLoading(true)
        try {
            const result = await cancelSubscription(feedback)
            if (result.success) {
                setOpen(false)
                if (onCancelSuccess) {
                    onCancelSuccess(result.subscription)
                } else {
                    router.refresh()
                }
            } else {
                alert(result.error || 'Failed to cancel subscription')
            }
        } catch (error) {
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    Cancel Subscription
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                        We're sorry to see you go. Please let us know why you're cancelling so we can improve.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="feedback">Reason for cancellation</Label>
                        <Textarea
                            id="feedback"
                            placeholder="I'm cancelling because..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Keep Subscription
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            'Confirm Cancellation'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
