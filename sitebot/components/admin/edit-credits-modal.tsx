'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminUpdateUserCredits } from '@/app/actions/admin-users'
import { Loader2 } from 'lucide-react'

interface EditCreditsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: {
        id: string
        email: string
        message_credits: number
    } | null
    onSuccess?: () => void
}

export function EditCreditsModal({
    open,
    onOpenChange,
    user,
    onSuccess,
}: EditCreditsModalProps) {
    const [amount, setAmount] = useState('')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!user || !amount || !reason) return

        setLoading(true)
        setError(null)

        const numAmount = parseInt(amount, 10)
        if (isNaN(numAmount)) {
            setError('Please enter a valid number')
            setLoading(false)
            return
        }

        const result = await adminUpdateUserCredits(user.id, numAmount, reason)

        if (result.success) {
            setAmount('')
            setReason('')
            onOpenChange(false)
            onSuccess?.()
        } else {
            setError(result.error || 'Failed to update credits')
        }

        setLoading(false)
    }

    const newCredits = user ? user.message_credits + (parseInt(amount, 10) || 0) : 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Message Credits</DialogTitle>
                    <DialogDescription>
                        Adjust credits for {user?.email}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Current Credits</Label>
                        <div className="text-2xl font-bold text-purple-500">
                            {user?.message_credits.toLocaleString()}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount to Add/Remove</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount (negative to remove)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Use negative numbers to remove credits (e.g., -500)
                        </p>
                    </div>
                    {amount && (
                        <div className="grid gap-2">
                            <Label>New Credits</Label>
                            <div className="text-lg font-semibold">
                                {Math.max(0, newCredits).toLocaleString()}
                            </div>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason (Required)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Enter reason for adjustment (e.g., Customer compensation, Bug fix credit, etc.)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!amount || !reason || loading}
                        className="bg-purple-500 hover:bg-purple-600"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Credits
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
