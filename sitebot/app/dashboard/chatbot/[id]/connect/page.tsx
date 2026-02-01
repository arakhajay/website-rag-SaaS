import { ConnectManager } from "@/components/dashboard/connect/connect-manager"

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function ConnectPage({ params }: PageProps) {
    const { id } = await params

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ConnectManager chatbotId={id} />
        </div>
    )
}
