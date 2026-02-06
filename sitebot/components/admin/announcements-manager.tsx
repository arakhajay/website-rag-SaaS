'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Loader2 } from 'lucide-react'
import {
    createAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    type Announcement
} from '@/app/actions/admin-controls'
import { useRouter } from 'next/navigation'

interface AnnouncementsManagerProps {
    initialAnnouncements: Announcement[]
}

export function AnnouncementsManager({ initialAnnouncements }: AnnouncementsManagerProps) {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<{
        title: string
        message: string
        type: 'info' | 'warning' | 'success' | 'maintenance'
        link_url: string
        link_text: string
        is_dismissible: boolean
    }>({
        title: '',
        message: '',
        type: 'info',
        link_url: '',
        link_text: '',
        is_dismissible: true
    })

    const handleCreate = async () => {
        if (!formData.title || !formData.message) return

        setIsLoading(true)
        try {
            const result = await createAnnouncement({
                title: formData.title,
                message: formData.message,
                type: formData.type,
                link_url: formData.link_url || undefined,
                link_text: formData.link_text || undefined,
                is_dismissible: formData.is_dismissible
            })

            if (result.success) {
                setFormData({
                    title: '',
                    message: '',
                    type: 'info',
                    link_url: '',
                    link_text: '',
                    is_dismissible: true
                })
                setIsCreating(false)
                router.refresh()
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggle = async (id: string, currentState: boolean) => {
        await toggleAnnouncement(id, !currentState)
        router.refresh()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return
        await deleteAnnouncement(id)
        router.refresh()
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Create Announcement</CardTitle>
                <Button
                    variant={isCreating ? 'outline' : 'default'}
                    onClick={() => setIsCreating(!isCreating)}
                >
                    {isCreating ? 'Cancel' : (
                        <>
                            <Plus className="h-4 w-4 mr-2" />
                            New Announcement
                        </>
                    )}
                </Button>
            </CardHeader>
            {isCreating && (
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                placeholder="Announcement title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'info' | 'warning' | 'success' | 'maintenance') =>
                                    setFormData(prev => ({ ...prev, type: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            placeholder="Announcement message..."
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Link URL (optional)</Label>
                            <Input
                                placeholder="https://..."
                                value={formData.link_url}
                                onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Link Text (optional)</Label>
                            <Input
                                placeholder="Learn more"
                                value={formData.link_text}
                                onChange={(e) => setFormData(prev => ({ ...prev, link_text: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="dismissible"
                                checked={formData.is_dismissible}
                                onCheckedChange={(checked) =>
                                    setFormData(prev => ({ ...prev, is_dismissible: checked }))
                                }
                            />
                            <Label htmlFor="dismissible">Allow users to dismiss</Label>
                        </div>

                        <Button onClick={handleCreate} disabled={isLoading || !formData.title || !formData.message}>
                            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Announcement
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
