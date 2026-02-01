'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Loader2, MoreVertical, Workflow as WorkflowIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow, type Workflow } from '@/app/actions/workflows'
import { Badge } from '@/components/ui/badge'

export function WorkflowsManager({ chatbotId }: { chatbotId: string }) {
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form State
    const [title, setTitle] = useState('')
    const [triggerCondition, setTriggerCondition] = useState('')
    const [instructions, setInstructions] = useState('')
    const [trainingPhrases, setTrainingPhrases] = useState<string[]>([])
    const [newPhrase, setNewPhrase] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadWorkflows()
    }, [chatbotId])

    async function loadWorkflows() {
        try {
            const data = await getWorkflows(chatbotId)
            setWorkflows(data)
        } catch (error) {
            console.error('Failed to load workflows', error)
        } finally {
            setLoading(false)
        }
    }

    function addPhrase() {
        if (!newPhrase.trim()) return
        if (!trainingPhrases.includes(newPhrase.trim())) {
            setTrainingPhrases([...trainingPhrases, newPhrase.trim()])
        }
        setNewPhrase('')
    }

    function removePhrase(index: number) {
        setTrainingPhrases(prev => prev.filter((_, i) => i !== index))
    }

    async function handleSubmit() {
        if (!title.trim() || !triggerCondition.trim() || !instructions.trim()) return

        setIsSubmitting(true)
        try {
            if (editingId) {
                await updateWorkflow(editingId, chatbotId, { title, trigger_condition: triggerCondition, instructions, training_phrases: trainingPhrases })
            } else {
                await createWorkflow(chatbotId, { title, trigger_condition: triggerCondition, instructions, training_phrases: trainingPhrases })
            }
            await loadWorkflows()
            setIsDialogOpen(false)
            resetForm()
        } catch (error) {
            console.error('Failed to save workflow', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleToggle(id: string, currentStatus: boolean) {
        setWorkflows(prev => prev.map(w => w.id === id ? { ...w, is_active: !currentStatus } : w))
        try {
            await updateWorkflow(id, chatbotId, { is_active: !currentStatus })
        } catch (error) {
            console.error('Failed to toggle workflow', error)
            loadWorkflows()
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this workflow?')) return
        try {
            await deleteWorkflow(id, chatbotId)
            setWorkflows(prev => prev.filter(w => w.id !== id))
        } catch (error) {
            console.error('Failed to delete workflow', error)
        }
    }

    function openEdit(workflow: Workflow) {
        setEditingId(workflow.id)
        setTitle(workflow.title)
        setTriggerCondition(workflow.trigger_condition)
        setInstructions(workflow.instructions)
        setTrainingPhrases(workflow.training_phrases || [])
        setIsDialogOpen(true)
    }

    function resetForm() {
        setEditingId(null)
        setTitle('')
        setTriggerCondition('')
        setInstructions('')
        setTrainingPhrases([])
        setNewPhrase('')
    }

    return (
        <Card className="h-full border-none shadow-none bg-transparent p-0">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Workflows</CardTitle>
                        <CardDescription>Make your bot behave differently in certain special conditions you define.</CardDescription>
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true) }} className="gap-2">
                        <Plus size={16} /> Add Workflow
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : workflows.length === 0 ? (
                    <div className="text-center p-12 border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <WorkflowIcon className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Start by adding a workflow</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                            Any workflow you create will show here. Workflows help handle complex scenarios like booking tickets or collecting leads.
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus size={16} className="mr-2" /> Add Workflow
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {workflows.map(workflow => (
                            <div key={workflow.id} className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors group">
                                <div className="space-y-1 flex-1 min-w-0 mr-4">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold truncate text-sm">{workflow.title}</h4>
                                        {!workflow.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">Inactive</span>}
                                    </div>
                                    <p className="text-sm text-muted-foreground font-mono bg-slate-100 dark:bg-slate-900 inline-block px-1 rounded text-xs mb-1">
                                        Trigger: {workflow.trigger_condition.substring(0, 50)}{workflow.trigger_condition.length > 50 ? '...' : ''}
                                    </p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{workflow.instructions}</p>
                                    {workflow.training_phrases && workflow.training_phrases.length > 0 && (
                                        <div className="flex gap-1 flex-wrap mt-2">
                                            {workflow.training_phrases.slice(0, 3).map((p, i) => (
                                                <Badge key={i} variant="outline" className="text-xs font-normal opacity-70">{p}</Badge>
                                            ))}
                                            {workflow.training_phrases.length > 3 && <Badge variant="outline" className="text-xs font-normal opacity-50">+{workflow.training_phrases.length - 3}</Badge>}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={workflow.is_active}
                                        onCheckedChange={() => handleToggle(workflow.id, workflow.is_active)}
                                    />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEdit(workflow)}>
                                                <Edit2 size={14} className="mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(workflow.id)}>
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
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Workflow' : 'Add Workflow'}</DialogTitle>
                            <DialogDescription>
                                Configure specific behaviors for complex scenarios.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="wf-title">Title</Label>
                                <Input
                                    id="wf-title"
                                    placeholder='Example: "Book a flight ticket"'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="trigger">Trigger Condition</Label>
                                    <span className="text-xs text-muted-foreground">{triggerCondition.length}/500</span>
                                </div>
                                <Textarea
                                    id="trigger"
                                    placeholder='Example: "Whenever a user wishes to book a flight ticket"'
                                    rows={2}
                                    value={triggerCondition}
                                    onChange={(e) => setTriggerCondition(e.target.value.slice(0, 500))}
                                />
                                <p className="text-xs text-muted-foreground">Describe when this workflow should activate.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Training phrases (Optional)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a phrase user might say..."
                                        value={newPhrase}
                                        onChange={(e) => setNewPhrase(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhrase())}
                                    />
                                    <Button type="button" variant="secondary" onClick={addPhrase}><Plus size={16} /></Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {trainingPhrases.map((phrase, idx) => (
                                        <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 h-7">
                                            {phrase}
                                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => removePhrase(idx)}>
                                                <X size={12} />
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="instructions">Instructions</Label>
                                    <span className="text-xs text-muted-foreground">{instructions.length}/2000</span>
                                </div>
                                <Textarea
                                    id="instructions"
                                    placeholder='Example: "If the user specifies destination..."'
                                    rows={6}
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value.slice(0, 2000))}
                                />
                                <p className="text-xs text-muted-foreground">Describe exactly how the bot should behave throughout this flow.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting || !title || !triggerCondition || !instructions}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Workflow
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
