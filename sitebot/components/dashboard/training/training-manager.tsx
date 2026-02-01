'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataSourcesManager } from './data-sources-manager'
import { GuidelinesManager } from './guidelines-manager'
import { WorkflowsManager } from './workflows-manager'
import { Book, FileText, Router, Workflow } from 'lucide-react'

export function TrainingManager({ chatbotId }: { chatbotId: string }) {
    return (
        <Tabs defaultValue="knowledge" className="h-full flex flex-col">
            <div className="mb-4">
                <TabsList className="w-full justify-start h-12 bg-transparent p-0 border-b rounded-none gap-6">
                    <TabsTrigger
                        value="knowledge"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-1 pb-3 pt-2 font-medium"
                    >
                        <Book size={16} className="mr-2" />
                        Knowledge Base
                    </TabsTrigger>
                    <TabsTrigger
                        value="guidelines"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-1 pb-3 pt-2 font-medium"
                    >
                        <FileText size={16} className="mr-2" />
                        Guidelines
                    </TabsTrigger>
                    <TabsTrigger
                        value="workflows"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-1 pb-3 pt-2 font-medium"
                    >
                        <Workflow size={16} className="mr-2" />
                        Workflows
                    </TabsTrigger>
                </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
                <TabsContent value="knowledge" className="h-full m-0 data-[state=inactive]:hidden">
                    <DataSourcesManager chatbotId={chatbotId} />
                </TabsContent>
                <TabsContent value="guidelines" className="h-full m-0 data-[state=inactive]:hidden overflow-y-auto pr-2">
                    <GuidelinesManager chatbotId={chatbotId} />
                </TabsContent>
                <TabsContent value="workflows" className="h-full m-0 data-[state=inactive]:hidden overflow-y-auto pr-2">
                    <WorkflowsManager chatbotId={chatbotId} />
                </TabsContent>
            </div>
        </Tabs>
    )
}
