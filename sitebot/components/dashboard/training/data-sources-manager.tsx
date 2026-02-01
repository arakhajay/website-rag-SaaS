'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, Link as LinkIcon, FileText, Upload, Database } from "lucide-react"
import { addTrainingSource } from "@/app/actions/chatbot"
import { SourceList } from "./source-list"

export function DataSourcesManager({ chatbotId }: { chatbotId: string }) {
    const [loading, setLoading] = useState(false)
    const [sourceUrl, setSourceUrl] = useState('')
    const [sourceText, setSourceText] = useState('')
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [files, setFiles] = useState<FileList | null>(null)
    const [csvFile, setCsvFile] = useState<File | null>(null)

    const handleAddWebsite = async () => {
        if (!sourceUrl) return
        setLoading(true)
        try {
            await addTrainingSource(chatbotId, 'website', sourceUrl)
            setSourceUrl('')
            setRefreshTrigger(prev => prev + 1)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddText = async () => {
        if (!sourceText) return
        setLoading(true)
        try {
            await addTrainingSource(chatbotId, 'text', sourceText)
            setSourceText('')
            setRefreshTrigger(prev => prev + 1)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUploadDefault = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!files || files.length === 0) return

        setLoading(true)
        try {
            // Upload each file
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData()
                formData.append('file', files[i])
                await addTrainingSource(chatbotId, 'file', formData)
            }
            setFiles(null)
            // Clear input manually if possible, or just rely on react state (input value won't clear visually without ref, but ok for MVP)
            setRefreshTrigger(prev => prev + 1)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUploadCsv = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!csvFile) return

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', csvFile)
            const res = await addTrainingSource(chatbotId, 'csv', formData)
            if (!res.success) {
                alert(`Error: ${res.error}`)
            } else {
                alert("CSV uploaded successfully!")
            }
            setCsvFile(null)
            setRefreshTrigger(prev => prev + 1)
        } catch (error: any) {
            console.error(error)
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>Knowledge Sources</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                <Tabs defaultValue="website" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="website"><LinkIcon className="h-4 w-4 mr-2" /> Website</TabsTrigger>
                        <TabsTrigger value="files"><Upload className="h-4 w-4 mr-2" /> Files</TabsTrigger>
                        <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2" /> Text</TabsTrigger>
                        <TabsTrigger value="csv"><Database className="h-4 w-4 mr-2" /> CSV</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 p-4 border rounded-lg bg-muted/50 mb-6">
                        <TabsContent value="website" className="space-y-4 mt-0">
                            <div className="space-y-2">
                                <Label>Website URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com/blog"
                                        value={sourceUrl}
                                        onChange={(e) => setSourceUrl(e.target.value)}
                                    />
                                    <Button onClick={handleAddWebsite} disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Crawl
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Scrapes all pages starting from this URL.</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="text" className="space-y-4 mt-0">
                            <div className="space-y-2">
                                <Label>Raw Text Content</Label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Paste important policies or information here..."
                                    value={sourceText}
                                    onChange={(e) => setSourceText(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleAddText} disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Add Text
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="files" className="mt-0">
                            <div className="space-y-4">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="file-upload">Upload PDF or Text Files</Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        accept=".pdf,.txt,.md,.doc,.docx"
                                        onChange={(e) => setFiles(e.target.files)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleUploadDefault} disabled={!files || loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Upload Files
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="csv" className="mt-0">
                            <div className="space-y-4">
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Label htmlFor="csv-upload">Upload CSV File (for SQL RAG)</Label>
                                    <Input
                                        id="csv-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleUploadCsv} disabled={!csvFile || loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Import CSV
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Rows will be stored in SQL for structured querying.</p>
                            </div>
                        </TabsContent>
                    </div>

                    <SourceList chatbotId={chatbotId} refreshTrigger={refreshTrigger} />
                </Tabs>
            </CardContent>
        </Card>
    )
}
