import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { OpenAIEmbeddings } from '@langchain/openai'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'

// ============================================
// CHAT MODEL DEFINITIONS
// ============================================

export interface ChatModelConfig {
    id: string
    label: string
    provider: 'openai' | 'google'
    description: string
    costTier: 'low' | 'medium' | 'high'
}

export const CHAT_MODELS: ChatModelConfig[] = [
    {
        id: 'gemini-2.0-flash',
        label: 'Gemini 2.0 Flash',
        provider: 'google',
        description: 'Fast & ultra-cheap — best value',
        costTier: 'low',
    },
    {
        id: 'gemini-2.5-flash',
        label: 'Gemini 2.5 Flash',
        provider: 'google',
        description: 'Latest Gemini Flash — smart & cheap',
        costTier: 'low',
    },
    {
        id: 'gpt-4o-mini',
        label: 'GPT-4o Mini',
        provider: 'openai',
        description: 'Affordable OpenAI model',
        costTier: 'medium',
    },
    {
        id: 'gpt-4.1-mini',
        label: 'GPT-4.1 Mini',
        provider: 'openai',
        description: 'Latest compact OpenAI model',
        costTier: 'medium',
    },
    {
        id: 'gpt-4o',
        label: 'GPT-4o',
        provider: 'openai',
        description: 'Most capable OpenAI model',
        costTier: 'high',
    },
]

/**
 * Get the AI SDK model instance for a given model ID.
 * Falls back to gemini-2.0-flash if the model ID is unknown.
 */
export function getChatModel(modelId: string) {
    const config = CHAT_MODELS.find(m => m.id === modelId)
    if (!config) {
        // Default fallback
        return google('gemini-2.0-flash')
    }

    switch (config.provider) {
        case 'google':
            return google(modelId)
        case 'openai':
            return openai(modelId)
        default:
            return google('gemini-2.0-flash')
    }
}

// ============================================
// EMBEDDING MODEL DEFINITIONS
// ============================================

export interface EmbeddingModelConfig {
    id: string
    label: string
    provider: 'openai' | 'google'
    description: string
    dimensions: number
}

export const EMBEDDING_MODELS: EmbeddingModelConfig[] = [
    {
        id: 'text-embedding-004',
        label: 'Gemini Embedding',
        provider: 'google',
        description: 'Free generous limits',
        dimensions: 768,
    },
    {
        id: 'text-embedding-3-small',
        label: 'OpenAI Small',
        provider: 'openai',
        description: '$0.02 / 1M tokens',
        dimensions: 1536,
    },
    {
        id: 'text-embedding-3-large',
        label: 'OpenAI Large',
        provider: 'openai',
        description: '$0.13 / 1M tokens — highest quality',
        dimensions: 3072,
    },
]

/**
 * Get a LangChain embeddings instance for a given embedding model ID.
 * Falls back to Gemini embedding if the model ID is unknown.
 */
export function getEmbeddingsModel(modelId: string) {
    const config = EMBEDDING_MODELS.find(m => m.id === modelId)

    if (!config || config.provider === 'google') {
        return new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            model: 'text-embedding-004',
        })
    }

    // OpenAI embeddings
    return new OpenAIEmbeddings({
        model: modelId,
    })
}

/**
 * Get the vector dimensions for a given embedding model.
 * This is critical for Pinecone index compatibility.
 */
export function getEmbeddingDimensions(modelId: string): number {
    const config = EMBEDDING_MODELS.find(m => m.id === modelId)
    return config?.dimensions ?? 768
}
