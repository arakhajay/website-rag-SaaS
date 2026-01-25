# 🤖 SiteBot - RAG-Powered Chatbot SaaS

A full-stack SaaS platform for creating AI chatbots trained on your own data. Built with Next.js 16, Supabase, Pinecone, and OpenAI.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-purple)

## ✨ Features

### ✅ Working Modules

#### 🔐 Authentication & User Management
- [x] Supabase Auth integration (Email/Password)
- [x] Protected routes with middleware
- [x] User profiles with organization support

#### 🤖 Chatbot Management
- [x] Create multiple chatbots per account
- [x] Chatbot switcher in dashboard
- [x] Settings page (rename, delete chatbot)

#### 📚 Knowledge Source Ingestion
| Source Type | Status | Description |
|-------------|--------|-------------|
| **Website** | ✅ Working | Crawl entire websites using Firecrawl API |
| **Text Files** | ✅ Working | Upload .txt, .md files |
| **Direct Text** | ✅ Working | Paste any text content |
| **CSV/SQL** | ✅ Working | Upload CSV for structured data queries |
| **PDF** | ✅ Working | Parse PDF documents (v1 library) |

#### 💬 Chat Interface
- [x] Real-time streaming responses
- [x] Markdown rendering (tables, lists, code)
- [x] Beautiful formatted output
- [x] Error handling with user feedback

#### 🔍 Hybrid RAG Retrieval
- [x] **Vector Search**: Pinecone-based semantic search
- [x] **SQL Agent**: Analyze CSV data with natural language
- [x] Combined context for comprehensive answers

### 🚧 Pending Modules

#### 📊 Analytics & Logs
- [ ] Chat Logs page - View conversation history
- [ ] Analytics dashboard - Usage statistics
- [ ] Leads capture from conversations

#### 🔌 Widget & Deployment
- [ ] Embeddable chat widget (Shadow DOM)
- [ ] Public API for widget integration
- [ ] Custom styling/theming options

#### 💳 Billing & Multi-tenancy
- [ ] Stripe integration for subscriptions
- [ ] Usage-based pricing
- [ ] Role-based access control
- [ ] Team/Organization features

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TailwindCSS 4 |
| Backend | Next.js API Routes, Server Actions |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL |
| Vector DB | Pinecone |
| AI/LLM | OpenAI GPT-4o, Embeddings |
| Web Crawl | Firecrawl |
| UI Components | Radix UI, shadcn/ui |

## 📁 Project Structure

```
sitebot/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat endpoint with hybrid RAG
│   │   └── test/          # Health check endpoint
│   ├── auth/              # Login, Register, Callback
│   ├── dashboard/
│   │   └── chatbot/[id]/
│   │       ├── training/  # Data ingestion page
│   │       ├── settings/  # Chatbot settings
│   │       └── logs/      # Chat history (pending)
│   └── actions/
│       ├── chatbot.ts     # CRUD operations
│       └── ingest.ts      # Data ingestion pipeline
├── components/
│   ├── dashboard/
│   │   ├── chat-interface.tsx
│   │   ├── data-sources-manager.tsx
│   │   └── chatbot-switcher.tsx
│   └── ui/                # shadcn components
├── lib/
│   ├── sql-agent.ts       # Hybrid SQL retriever
│   ├── supabase/          # Auth clients
│   └── logger.ts          # Debug logging
└── middleware.ts          # Auth protection
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Pinecone account
- OpenAI API key
- Firecrawl API key

### Environment Variables

Create `.env.local` in the `sitebot` folder:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Pinecone
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name

# Firecrawl
FIRECRAWL_API_KEY=your_firecrawl_key
```

### Installation

```bash
cd sitebot
npm install
npm run dev
```

Visit `http://localhost:3000`

## 📊 Database Schema

### Tables (Supabase)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles linked to auth |
| `chatbots` | Chatbot configurations |
| `training_sources` | Ingested data sources metadata |
| `csv_data` | Structured CSV data (JSONB) |

## 🔧 API Reference

### POST /api/chat

Chat with a trained chatbot.

```json
{
  "chatbotId": "uuid",
  "messages": [
    { "role": "user", "content": "What is machine learning?" }
  ]
}
```

Returns: Streaming text response with markdown formatting.

## 📝 License

MIT

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Pinecone](https://pinecone.io) - Vector database
- [OpenAI](https://openai.com) - AI models
- [Firecrawl](https://firecrawl.dev) - Web crawling
- [shadcn/ui](https://ui.shadcn.com) - UI components
