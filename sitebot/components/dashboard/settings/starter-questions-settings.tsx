'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { type ChatbotSettings } from "@/app/actions/settings"

interface StarterQuestionsSettingsProps {
    settings: ChatbotSettings
    onSave: (settings: ChatbotSettings) => void
}

export function StarterQuestionsSettings({ settings, onSave }: StarterQuestionsSettingsProps) {
    const [questions, setQuestions] = useState<string[]>(settings.starter_questions || [])
    const [newQuestion, setNewQuestion] = useState("")

    const handleAdd = () => {
        if (!newQuestion.trim()) return
        const updated = [...questions, newQuestion.trim()]
        setQuestions(updated)
        setNewQuestion("")
        onSave({ ...settings, starter_questions: updated })
    }

    const handleRemove = (index: number) => {
        const updated = questions.filter((_, i) => i !== index)
        setQuestions(updated)
        onSave({ ...settings, starter_questions: updated })
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-1">Starter Questions</h2>
                <p className="text-sm text-muted-foreground">These will be shown immediately when the chat opens.</p>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="e.g., What is your pricing?"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <Button onClick={handleAdd} variant="outline">
                        <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                </div>

                <div className="space-y-2">
                    {questions.map((q, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-md border group">
                            <span className="text-sm">{q}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(i)}
                                className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {questions.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No starter questions added yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
