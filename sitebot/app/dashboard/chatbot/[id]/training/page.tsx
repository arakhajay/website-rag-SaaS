'use client'
import { useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Globe, FileText, Database, Type, Loader2, ArrowLeft, CheckCircle, XCircle, Send, RefreshCw, Upload } from 'lucide-react'
import Link from 'next/link'
import { ingestWebsite, ingestText, ingestFile, ingestCSV } from '@/app/actions/ingest'
import { useChat } from '@ai-sdk/react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function TrainingPage() {
    const params = useParams()
    const id = params.id as string
    const fileInputRef = useRef<HTMLInputElement>(null)
    const csvInputRef = useRef<HTMLInputElement>(null)

    // Website Tab State
    const [websiteUrl, setWebsiteUrl] = useState('')
    const [websiteLoading, setWebsiteLoading] = useState(false)
    const [websiteStatus, setWebsiteStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [websiteMessage, setWebsiteMessage] = useState('')

    // Text Tab State
    const [textContent, setTextContent] = useState('')
    const [textLoading, setTextLoading] = useState(false)
    const [textStatus, setTextStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [textMessage, setTextMessage] = useState('')

    // File Tab State
    const [fileLoading, setFileLoading] = useState(false)
    const [fileStatus, setFileStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [fileMessage, setFileMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // CSV Tab State
    const [csvLoading, setCsvLoading] = useState(false)
    const [csvStatus, setCsvStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [csvMessage, setCsvMessage] = useState('')
    const [selectedCsv, setSelectedCsv] = useState<File | null>(null)

    // Chat State
    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: '/api/chat',
        body: { chatbotId: id },
    } as any) as any

    const handleWebsiteIngest = async () => {
        if (!websiteUrl) return
        setWebsiteLoading(true)
        setWebsiteStatus('idle')
        setWebsiteMessage('Crawling website...')

        try {
            const result = await ingestWebsite(id, websiteUrl)
            if (result.success) {
                setWebsiteStatus('success')
                setWebsiteMessage(`Successfully indexed ${result.chunks} chunks from ${result.url}!`)
            } else {
                setWebsiteStatus('error')
                setWebsiteMessage(result.error || 'Failed to ingest website')
            }
        } catch (error: any) {
            setWebsiteStatus('error')
            setWebsiteMessage(error.message || 'An unexpected error occurred')
        } finally {
            setWebsiteLoading(false)
        }
    }

    const handleTextIngest = async () => {
        if (!textContent.trim()) return
        setTextLoading(true)
        setTextStatus('idle')
        setTextMessage('Indexing text...')

        try {
            const result = await ingestText(id, textContent)
            if (result.success) {
                setTextStatus('success')
                setTextMessage(`Successfully indexed ${result.chunks} chunks!`)
                setTextContent('')
            } else {
                setTextStatus('error')
                setTextMessage(result.error || 'Failed to ingest text')
            }
        } catch (error: any) {
            setTextStatus('error')
            setTextMessage(error.message || 'An unexpected error occurred')
        } finally {
            setTextLoading(false)
        }
    }

    const handleFileUpload = async () => {
        if (!selectedFile) return
        setFileLoading(true)
        setFileStatus('idle')
        setFileMessage('Reading and indexing file...')

        try {
            const fileContent = await selectedFile.text()
            const result = await ingestFile(id, selectedFile.name, fileContent)
            if (result.success) {
                setFileStatus('success')
                setFileMessage(`Successfully indexed ${result.chunks} chunks from ${selectedFile.name}!`)
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
            } else {
                setFileStatus('error')
                setFileMessage(result.error || 'Failed to ingest file')
            }
        } catch (error: any) {
            setFileStatus('error')
            setFileMessage(error.message || 'An unexpected error occurred')
        } finally {
            setFileLoading(false)
        }
    }

    const handleCsvUpload = async () => {
        if (!selectedCsv) return
        setCsvLoading(true)
        setCsvStatus('idle')
        setCsvMessage('Parsing and storing CSV data...')

        try {
            const csvContent = await selectedCsv.text()
            const result = await ingestCSV(id, selectedCsv.name, csvContent)
            if (result.success) {
                setCsvStatus('success')
                setCsvMessage(`Successfully stored ${result.rowCount} rows with columns: ${result.headers?.join(', ')}`)
                setSelectedCsv(null)
                if (csvInputRef.current) csvInputRef.current.value = ''
            } else {
                setCsvStatus('error')
                setCsvMessage(result.error || 'Failed to ingest CSV')
            }
        } catch (error: any) {
            setCsvStatus('error')
            setCsvMessage(error.message || 'An unexpected error occurred')
        } finally {
            setCsvLoading(false)
        }
    }

    return (
        <div className="py-6 h-[calc(100vh-2rem)] flex flex-col">
            <div className="mb-6 flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Content & Training</h1>
                        <p className="text-muted-foreground text-sm">Manage knowledge sources for your chatbot.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/chatbot/${id}/settings`}>
                        <Button variant="outline">Bot Settings</Button>
                    </Link>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 px-2">
                {/* Left Column: Training Tabs */}
                <div className="col-span-7 flex flex-col min-h-0">
                    <Tabs defaultValue="website" className="flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="website" className="flex items-center gap-2">
                                <Globe className="h-4 w-4" /> Website
                            </TabsTrigger>
                            <TabsTrigger value="files" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Files
                            </TabsTrigger>
                            <TabsTrigger value="database" className="flex items-center gap-2">
                                <Database className="h-4 w-4" /> Database
                            </TabsTrigger>
                            <TabsTrigger value="text" className="flex items-center gap-2">
                                <Type className="h-4 w-4" /> Text
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 mt-4 overflow-y-auto">
                            {/* Website Tab */}
                            <TabsContent value="website" className="mt-0 h-full">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Website Crawling</CardTitle>
                                        <CardDescription>
                                            Enter a URL to scrape and index the page content.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="url">Website URL</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="url"
                                                    placeholder="https://example.com"
                                                    value={websiteUrl}
                                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                                    disabled={websiteLoading}
                                                />
                                                <Button onClick={handleWebsiteIngest} disabled={websiteLoading || !websiteUrl}>
                                                    {websiteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Fetch & Train
                                                </Button>
                                            </div>
                                        </div>
                                        <div className={`rounded-md p-4 text-sm flex items-center gap-2 ${websiteStatus === 'success' ? 'bg-green-500/10 text-green-600' :
                                                websiteStatus === 'error' ? 'bg-red-500/10 text-red-600' :
                                                    'bg-muted text-muted-foreground'
                                            }`}>
                                            {websiteStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                                            {websiteStatus === 'error' && <XCircle className="h-4 w-4" />}
                                            {websiteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            <p>{websiteMessage || 'Enter a URL and click "Fetch & Train" to begin.'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Files Tab */}
                            <TabsContent value="files" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>File Upload</CardTitle>
                                        <CardDescription>
                                            Upload PDF or Text files to be indexed for RAG.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="file">Document (TXT, MD)</Label>
                                            <Input
                                                ref={fileInputRef}
                                                id="file"
                                                type="file"
                                                accept=".txt,.md"
                                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                                disabled={fileLoading}
                                            />
                                            {selectedFile && (
                                                <p className="text-sm text-muted-foreground">
                                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={handleFileUpload}
                                            disabled={fileLoading || !selectedFile}
                                        >
                                            {fileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload & Train
                                        </Button>
                                        <div className={`rounded-md p-4 text-sm flex items-center gap-2 ${fileStatus === 'success' ? 'bg-green-500/10 text-green-600' :
                                                fileStatus === 'error' ? 'bg-red-500/10 text-red-600' :
                                                    'bg-muted text-muted-foreground'
                                            }`}>
                                            {fileStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                                            {fileStatus === 'error' && <XCircle className="h-4 w-4" />}
                                            {fileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            <p>{fileMessage || 'Select a file to upload and train.'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Database Tab */}
                            <TabsContent value="database" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>CSV / Structured Data</CardTitle>
                                        <CardDescription>
                                            Upload CSV files to store in SQL database for structured querying.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="csv-file">CSV File</Label>
                                            <Input
                                                ref={csvInputRef}
                                                id="csv-file"
                                                type="file"
                                                accept=".csv"
                                                onChange={(e) => setSelectedCsv(e.target.files?.[0] || null)}
                                                disabled={csvLoading}
                                            />
                                            {selectedCsv && (
                                                <p className="text-sm text-muted-foreground">
                                                    Selected: {selectedCsv.name} ({(selectedCsv.size / 1024).toFixed(1)} KB)
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={handleCsvUpload}
                                            disabled={csvLoading || !selectedCsv}
                                        >
                                            {csvLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Database className="mr-2 h-4 w-4" />
                                            Upload & Analyze
                                        </Button>
                                        <div className={`rounded-md p-4 text-sm flex items-center gap-2 ${csvStatus === 'success' ? 'bg-green-500/10 text-green-600' :
                                                csvStatus === 'error' ? 'bg-red-500/10 text-red-600' :
                                                    'bg-muted text-muted-foreground'
                                            }`}>
                                            {csvStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                                            {csvStatus === 'error' && <XCircle className="h-4 w-4" />}
                                            {csvLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            <p>{csvMessage || 'Upload CSV to store as SQL data and enable structured queries.'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Text Tab */}
                            <TabsContent value="text" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Text Input</CardTitle>
                                        <CardDescription>
                                            Directly paste text content to be indexed.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="text-content">Content</Label>
                                            <Textarea
                                                id="text-content"
                                                placeholder="Paste your text here..."
                                                className="min-h-[150px]"
                                                value={textContent}
                                                onChange={(e) => setTextContent(e.target.value)}
                                                disabled={textLoading}
                                            />
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={handleTextIngest}
                                            disabled={textLoading || !textContent.trim()}
                                        >
                                            {textLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Index Text
                                        </Button>
                                        <div className={`rounded-md p-4 text-sm flex items-center gap-2 ${textStatus === 'success' ? 'bg-green-500/10 text-green-600' :
                                                textStatus === 'error' ? 'bg-red-500/10 text-red-600' :
                                                    'bg-muted text-muted-foreground'
                                            }`}>
                                            {textStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                                            {textStatus === 'error' && <XCircle className="h-4 w-4" />}
                                            {textLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                            <p>{textMessage || 'Paste text content and click "Index Text" to begin.'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Right Column: Chat Interface */}
                <div className="col-span-5 flex flex-col min-h-0 border rounded-lg bg-card overflow-hidden">
                    <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                        <h3 className="font-semibold">Test Your Chatbot</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMessages([])}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {messages.map((m: any) => (
                            <div
                                key={m.id}
                                className={`mb-4 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`rounded-lg px-4 py-2 max-w-[85%] ${m.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-20">
                                <p className="text-sm">Add training data on the left,</p>
                                <p className="text-sm">then test your chatbot here!</p>
                            </div>
                        )}
                    </ScrollArea>

                    <div className="p-4 border-t">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Ask something..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isLoading} size="icon">
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
