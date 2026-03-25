import { NextRequest, NextResponse } from "next/server";
import { getIntegrationByWebhook, incrementIntegrationMessageCount } from "@/app/actions/integrations";
import { createAdminClient } from "@/lib/supabase/admin";
import { getChatModel, getEmbeddingsModel } from "@/lib/ai-models";
import { generateAndRunSQL } from "@/lib/sql-agent";
import { generateText } from "ai";
import { logInfo, logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const url = new URL(req.url);
    const chatbotId = url.searchParams.get("chatbot_id");
    
    try {
        if (!chatbotId) {
            logError("Telegram Webhook", "Missing chatbot_id parameter");
            return new NextResponse("Missing chatbot_id", { status: 400 });
        }

        // 0. Parse Body Robustly
        let body;
        try {
            body = await req.json();
        } catch (e) {
            logError("Telegram Webhook JSON Parse", `Failed to parse request body: ${e}`);
            return new NextResponse("Invalid JSON", { status: 400 });
        }

        const message = body.message || body.edited_message;
        
        // If it's not a text message, cleanly exit
        if (!message || !message.text || !message.chat || !message.chat.id) {
            logInfo("Telegram Webhook", "Ignored non-text message or unsupported event type");
            return new NextResponse("OK", { status: 200 });
        }

        const chatId = message.chat.id;
        const userQuery = message.text;

        logInfo("Telegram Webhook", `Query: "${userQuery}" from Chat: ${chatId} (Bot: ${chatbotId})`);

        // 1. Fetch Integration Details
        const { integration, error: intError } = await getIntegrationByWebhook('telegram', chatbotId);
        
        if (intError || !integration || !integration.config.bot_token) {
            logError("Telegram Webhook", `Integration check failed: ${intError || "Config missing"}`);
            return new NextResponse("Integration invalid", { status: 404 });
        }

        const botToken = integration.config.bot_token;

        // 2. Advanced RAG Retrieval
        const adminClient = createAdminClient();
        
        logInfo("Telegram Webhook", "Starting context retrieval (Vector + SQL)");

        const vectorPromise = (async () => {
            try {
                const embeddings = getEmbeddingsModel('text-embedding-3-small')
                const vector = await embeddings.embedQuery(userQuery)
                
                const { data: results, error: rpcError } = await adminClient.rpc('match_documents', {
                    query_embedding: JSON.stringify(vector), 
                    match_chatbot_id: chatbotId,
                    match_count: 5,
                    match_threshold: 0.2
                })

                if (rpcError) {
                    logError('Telegram Webhook MatchDocuments RPC', rpcError);
                    return '';
                }

                return results?.map((r: any) => r.content).join('\n\n') || ''
            } catch (e) {
                logError('Telegram Webhook Vector Search Exception', e)
                return ''
            }
        })();

        const sqlPromise = (async () => {
            try {
                return await generateAndRunSQL(chatbotId, userQuery) || ''
            } catch (e) {
                logError('Telegram Webhook SQL Search Exception', e)
                return ''
            }
        })();

        const rulesPromise = (async () => {
             const { data: guidelines } = await adminClient.from('guidelines').select('title, content').eq('chatbot_id', chatbotId).eq('is_active', true)
             const { data: workflows } = await adminClient.from('workflows').select('title, trigger_condition, instructions, training_phrases').eq('chatbot_id', chatbotId).eq('is_active', true)
             return { guidelines: guidelines || [], workflows: workflows || [] }
        })();

        const [vectorContext, sqlContext, rules] = await Promise.all([vectorPromise, sqlPromise, rulesPromise]);
        
        logInfo("Telegram Webhook", `Retrieval complete. Vector: ${vectorContext.length} chars, SQL: ${sqlContext.length} chars`);

        // 3. Combine Context and Construct Prompt
        let combinedContext = ''
        if (vectorContext) combinedContext += `**From Documents:**\n${vectorContext}\n\n`
        if (sqlContext) combinedContext += `**From Structured Data:**\n${sqlContext}`
        if (!combinedContext) combinedContext = 'No specific relevant information found in the knowledge base.'

        let guidelinesText = rules.guidelines.length > 0 ? '\n**BEHAVIORAL GUIDELINES:**\n' + rules.guidelines.map((g: any) => `- ${g.title}: ${g.content}`).join('\n') : ''
        let workflowsText = rules.workflows.length > 0 ? '\n\n**SPECIALIZED WORKFLOWS:**\n' + rules.workflows.map((w: any, i: number) => `${i + 1}. [${w.title}]\n   Trigger: "${w.trigger_condition}"\n   Instructions: ${w.instructions}`).join('\n\n') : ''

        const { data: botData } = await adminClient.from('chatbots').select('name').eq('id', chatbotId).single()
        const botName = botData?.name || 'this chatbot'

        const systemPrompt = `You are the official Support AI Assistant for ${botName}. Answer questions based on the provided context.
**CONTEXT:**
${combinedContext}
${guidelinesText}
${workflowsText}

**RESPONSE GUIDELINES:**
- Keep your answers beautifully concise. Telegram users prefer quick responses.
- Answer questions based ONLY on the provided context.
- IMPORTANT: Assume all provided context refers to ${botName}. If the user asks about ${botName} (or the person it represents), use the context to answer.
- If the user is just greeting you (e.g., "Hi", "Hello"), respond with a friendly greeting and ask how you can help.
- If the provided context does not contain the answer, explicitly state that you don't have that specific information in your knowledge base.
- Do NOT make up information or use outside knowledge.
- Use plain text or basic Markdown bold/italic only.`

        // 4. Model & Chat Action
        const { data: botSettings } = await adminClient.from('chatbot_settings').select('messaging').eq('chatbot_id', chatbotId).maybeSingle()
        const selectedChatModel = (botSettings?.messaging as any)?.model || 'gemini-2.0-flash'

        // Fire & Forget: Send typing action
        fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ chat_id: chatId, action: 'typing' })
        }).catch(() => {});

        // 5. AI Generation
        logInfo("Telegram Webhook", `Invoking AI model: ${selectedChatModel}`);
        const { text: responseText } = await generateText({
            model: getChatModel(selectedChatModel),
            system: systemPrompt,
            messages: [{ role: 'user', content: userQuery }]
        });

        // 6. Reply to Telegram
        logInfo("Telegram Webhook", "Sending response to Telegram API...");
        const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: responseText
            })
        });

        if (!telegramRes.ok) {
            const errData = await telegramRes.text();
            logError("Telegram Webhook API Response", `Error ${telegramRes.status}: ${errData}`);
        } else {
            logInfo("Telegram Webhook", "Response successfully sent to Telegram.");
        }

        // 7. Update Stats
        incrementIntegrationMessageCount(integration.id).catch(() => {});

        return new NextResponse("OK", { status: 200 });
    } catch (e) {
        logError("Telegram Webhook Critical failure", e);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
