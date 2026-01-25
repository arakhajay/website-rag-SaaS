export default function ChatbotLogsPage({ params }: { params: { id: string } }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Chat Logs for Bot {params.id}</h1>
            <p className="text-muted-foreground">View conversation history specifically for this chatbot.</p>
        </div>
    )
}
