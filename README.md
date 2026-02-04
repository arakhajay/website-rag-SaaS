# 🤖 SiteBot - RAG-Powered Chatbot SaaS

A full-stack SaaS platform for creating AI chatbots trained on your own data. Built with Next.js 16, Supabase, Pinecone, and OpenAI.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-purple)

## 🚀 Features

### ✅ Working Modules

| Module                       | Status     | Description                                                  |
| ---------------------------- | ---------- | ------------------------------------------------------------ |
| 🔐 **Authentication**         | ✅ Complete | Supabase Auth (Email/Password)                               |
| 🤖 **Chatbot CRUD**           | ✅ Complete | Create, rename, delete chatbots                              |
| 📊 **Leads Management**       | ✅ Complete | Capture leads via widget form, manage status in dashboard    |
| 🌐 **Website Ingestion**      | ✅ Complete | Crawl sites with Firecrawl + **Deduplication**               |
| 📝 **Text/MD Files**          | ✅ Complete | Upload and parse text files                                  |
| ✏️ **Direct Text**            | ✅ Complete | Paste any content                                            |
| 📊 **CSV/SQL Data**           | ✅ Complete | Structured data with natural language queries                |
| 📄 **PDF Files**              | ✅ Complete | Parse PDF documents                                          |
| 💬 **Chat Interface**         | ✅ Complete | Streaming + Markdown rendering                               |
| 🔀 **Hybrid RAG**             | ✅ Complete | Vector Search + SQL Agent                                    |
| 🧩 **Embed Widget**           | ✅ Complete | Dynamic styling, User Form, Working Hours, Starter Questions |
| 📜 **Chat Logs**              | ✅ Complete | View grouped sessions, message history, and clear logs       |
| ⚙️ **Extended Settings**      | ✅ Complete | Email, Security, User Forms, Working Hours, Switcher         |
| 🔗 **Connect Tab**            | ✅ Complete | Embed Code & REST API Details                                |
| ⚡ **Guidelines & Workflows** | ✅ Complete | Behavioral control & Structured processes                    |
| 📈 **Analytics Dashboard**    | ✅ Complete | Usage stats, AI Analyst, conversation metrics, session charts |
| 🏠 **Dashboard Home**         | ✅ Complete | Real-time usage, training stats, and daily session chart     |

### 🚧 Pending Modules

| Module      | Status    | Description                              |
| ----------- | --------- | ---------------------------------------- |
| 💳 Billing   | 🕐 Pending | Stripe integration                       |

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
| Vector DB | Pinecone (Serverless)               |
| AI/LLM    | OpenAI GPT-4o                       |
| Web Crawl | Firecrawl                           |
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
│   ├ actions/        # Server actions (ingest, leads, chat-logs, analytics, dashboard-stats)
│   ├ auth/           # Login, Register
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
PINECONE_API_KEY=
PINECONE_INDEX=
FIRECRAWL_API_KEY=
\\\

## 📝 License

MIT
