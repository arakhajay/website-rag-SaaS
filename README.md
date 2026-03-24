# ⚡ Zivox Agent - RAG-Powered Chatbot SaaS

A professional, RAG-powered AI chatbot platform for creating custom assistants trained on your own data. Featuring multi-model AI support (Gemini + OpenAI), Supabase pgvector for vector search, premium dark-themed UI, robust analytics, and seamless integration.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB%20%26%20pgvector-green)
![AI Models](https://img.shields.io/badge/AI-Gemini%20%2B%20OpenAI-purple)

## 🚀 Features

### ✅ Working Modules

| Module                       | Status     | Description                                                  |
| ---------------------------- | ---------- | ------------------------------------------------------------ |
| 🔐 **Authentication**         | ✅ Complete | Supabase Auth (Email/Username/Password)                      |
| 🤖 **Chatbot CRUD**           | ✅ Complete | Create, rename, delete chatbots                              |
| 📊 **Leads Management**       | ✅ Complete | Capture leads via widget form, manage status in dashboard    |
| 🌐 **Website Ingestion**      | ✅ Complete | Crawl sites with Firecrawl + **Deduplication**               |
| 📝 **Text/MD Files**          | ✅ Complete | Upload and parse text files                                  |
| ✏️ **Direct Text**            | ✅ Complete | Paste any content                                            |
| 📊 **CSV/SQL Data**           | ✅ Complete | Structured data with natural language queries                |
| 📄 **PDF Files**              | ✅ Complete | Parse PDF & DOCX via **LlamaIndex/LlamaParse**               |
| 💬 **Chat Interface**         | ✅ Complete | Streaming + Markdown rendering                               |
| 🔀 **Hybrid RAG**             | ✅ Complete | Supabase pgvector + SQL Agent                                |
| 🧩 **Embed Widget**           | ✅ Complete | Dynamic styling, User Form, Working Hours, Starter Questions |
| 📜 **Chat Logs**              | ✅ Complete | View grouped sessions, message history, and clear logs       |
| ⚙️ **Extended Settings**      | ✅ Complete | Email, Security, User Forms, Working Hours, Switcher         |
| 🔗 **Connect Tab**            | ✅ Complete | Embed Code & REST API Details                                |
| ⚡ **Guidelines & Workflows** | ✅ Complete | Behavioral control & Structured processes                    |
| 📈 **Analytics Dashboard**    | ✅ Complete | Usage stats, AI Analyst, conversation metrics, session charts |
| 🏠 **Dashboard Home**         | ✅ Complete | Real-time usage, training stats, and daily session chart     |
| 📜 **Legal Pages**            | ✅ Complete | Professional Terms of Service & Privacy Policy pages         |
| 🎨 **Design System**          | ✅ Complete | Premium Dark Mode, Glassmorphism, Inter Typography           |

| 💳 **Billing & Subscriptions** | ✅ Complete | Dodo Payments, plan upgrades, cancellations & limits       |
| 👤 **Username Support**        | ✅ Complete | Sign in with email or username                               |
| 🛡️ **Admin Dashboard**         | ✅ Complete | User/chatbot management, revenue analytics, audit logs       |
| 🔒 **Subscription Gating**     | ✅ Complete | Plan-based chatbot creation limits with upgrade prompts      |

## 📈 Analytics Features

- **Conversation Metrics** - Track total conversations, messages, and response times
- **AI Analyst** - Ask questions about your chatbot usage in natural language
- **Date Range Filters** - Filter analytics by custom date ranges
- **Lead Tracking** - Monitor lead capture performance

## 🏠 Dashboard Home

- **Usage Widget** - Monthly message credits tracking
- **Training Widget** - Training characters used
- **Session Chart** - Daily chat sessions (last 7 days)

## 🔌 Widget Embed Code

\\\html
<script
    src="http://localhost:3000/widget.bundle.js"
    data-chatbot-id="YOUR_CHATBOT_ID"
></script>
\\\

## ⚙️ Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Frontend  | Next.js 16, React 19, TailwindCSS 4 |
| Backend   | Next.js API Routes, Server Actions  |
| Auth      | Supabase Auth                       |
| Database  | Supabase PostgreSQL                 |
| Vector DB | Supabase pgvector                   |
| AI/LLM    | Gemini 2.0/2.5 Flash, GPT-4o, GPT-4o-mini, GPT-4.1-mini |
| Embeddings| OpenAI text-embedding-3-small       |
| Payments  | Dodo Payments                       |
| Web Crawl | Firecrawl                           |
| Parsing   | LlamaParse (REST API)               |
| Chunking  | LlamaIndex (SentenceSplitter)       |
| Widget    | Preact + Vite (60KB bundle)         |
| UI        | Radix UI, shadcn/ui                 |

## 🚀 Quick Start

\\\ash
cd sitebot
npm install
npm run dev
\\\

## 📂 Project Structure

\\\
sitebot/
├ app/
│   ├ api/chat/       # RAG chat endpoint (with logging)
│   ├ api/leads/      # Lead submission endpoint
│   ├ api/webhooks/   # Dodo Payments webhooks
│   ├ actions/        # Server actions (ingest, leads, chat-logs, analytics, subscription, auth)
│   ├ admin/          # Admin panel (users, chatbots, analytics, announcements)
│   ├ auth/           # Login, Register (email/username)
│   ├ dashboard/      # Main app (Leads, Logs, Training, Analytics, Connect)
├ components/         # React components
│   ├ dashboard/
│       ├ analytics/  # Analytics dashboard components
│       ├ leads/      # Leads management components
│       ├ logs/       # Chat logs components
├ lib/
│   ├ sql-agent.ts    # CSV data analyzer
│   ├ supabase/       # Auth clients
├ widget/             # Embeddable chat widget (Preact)
├ scripts/            # Debug & migration scripts
├ supabase/
    ├ migrations/     # Database schema (Auth, Logs, Leads)
\\\

## 🔐 Environment Variables

\\\env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
FIRECRAWL_API_KEY=
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_SECRET=
LLAMA_CLOUD_API_KEY=
\\\

## 📝 License

MIT
