'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Loader2, MoreVertical, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getGuidelines, createGuideline, updateGuideline, deleteGuideline, type Guideline } from '@/app/actions/guidelines'
// import { toast } from 'sonner' // Removed to avoid dependency issues

export function GuidelinesManager({ chatbotId }: { chatbotId: string }) {
    const [guidelines, setGuidelines] = useState<Guideline[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form State
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadGuidelines()
    }, [chatbotId])

    async function loadGuidelines() {
        try {
            const data = await getGuidelines(chatbotId)
            setGuidelines(data)
        } catch (error) {
            console.error('Failed to load guidelines', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit() {
        if (!title.trim() || !content.trim()) return

        setIsSubmitting(true)
        try {
            if (editingId) {
                await updateGuideline(editingId, chatbotId, { title, content })
            } else {
                await createGuideline(chatbotId, { title, content })
            }
            await loadGuidelines()
            setIsDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error('Failed to save guideline', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleToggle(id: string, currentStatus: boolean) {
        // Optimistic update
        setGuidelines(prev => prev.map(g => g.id === id ? { ...g, is_active: !currentStatus } : g))
        try {
            await updateGuideline(id, chatbotId, { is_active: !currentStatus })
        } catch (error) {
            console.error('Failed to toggle guideline', error)
            loadGuidelines() // Revert on error
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this guideline?')) return
        try {
            await deleteGuideline(id, chatbotId)
            setGuidelines(prev => prev.filter(g => g.id !== id))
        } catch (error) {
            console.error('Failed to delete guideline', error)
        }
    }

    function openEdit(guideline: Guideline) {
        setEditingId(guideline.id)
        setTitle(guideline.title)
        setContent(guideline.content)
        setIsDialogOpen(true)
    }

    function resetForm() {
        setEditingId(null)
        setTitle('')
        setContent('')
    }

    return (
        <Card className="h-full border-none shadow-none bg-transparent p-0">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Guidelines Manager</CardTitle>
                        <CardDescription>Fine tune your bot's automatically generated responses by adding customized instructions.</CardDescription>
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true) }} className="gap-2">
                        <Plus size={16} /> Add new
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : guidelines.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <FileText className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Start by adding a guideline</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                            Any guideline you create will be shown here. Start creating by clicking on Add new.
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus size={16} className="mr-2" /> Add new
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {guidelines.map(guideline => (
                            <div key={guideline.id} className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors group">
                                <div className="space-y-1 flex-1 min-w-0 mr-4">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold truncate text-sm">{guideline.title}</h4>
                                        {!guideline.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">Inactive</span>}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{guideline.content}</p>
                                    <div className="text-xs text-muted-foreground pt-1">
                                        Last modified: {new Date(guideline.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={guideline.is_active}
                                        onCheckedChange={() => handleToggle(guideline.id, guideline.is_active)}
                                    />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEdit(guideline)}>
                                                <Edit2 size={14} className="mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(guideline.id)}>
                                                <Trash2 size={14} className="mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Guideline' : 'Add Guideline'}</DialogTitle>
                            <DialogDescription>
                                Customize your bot's behaviour with your own instructions.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder='Example: "Tone of Voice"'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">For reference only and doesn't affect your bot's behaviour</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="content">Guideline</Label>
                                    <span className="text-xs text-muted-foreground">{content.length}/500</span>
                                </div>
                                <Textarea
                                    id="content"
                                    placeholder='Example: "Always respond in a professional and concise manner..."'
                                    rows={5}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value.slice(0, 500))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting || !title || !content}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Guideline
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
