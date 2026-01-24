# Sitebot SaaS Clone - Implementation Plan

## Overview
This document outlines the step-by-step execution plan for building the Sitebot SaaS Clone. The project is divided into 4 main phases, ensuring a modular and verifiable development process.

## Phase 1: Foundation & Identity
**Objective:** Establish the secure perimeter, database schema, and core application scaffolding.

### 1.1 Project Initialization
- [ ] Initialize Next.js 15 App (App Router, TypeScript, Tailwind CSS).
- [ ] Install Shadcn UI and core components (Button, Input, Dialog, Dropdown).
- [ ] Configure `lucide-react` for icons.

### 1.2 Database & Authentication (Supabase)
- [ ] Initialize Supabase project.
- [ ] Implement Supabase SSR Auth (Google OAuth + Email/Password).
- [ ] Create `public.profiles` table synced with `auth.users` via Postgres Triggers.
- [ ] Create `public.chatbots` table with RLS policies.
- [ ] **Verification:** Use Browser Tool to clean sign-up flow and verify user record in DB.

### 1.3 Dashboard UI (Frontend)
- [ ] Create Layout shell (Sidebar, Header, User Menu).
- [ ] Build "My Chatbots" list view.
- [ ] Build "Create Chatbot" Modal (URL input).
- [ ] **State:** Implement strict typing for Database rows.

## Phase 2: The Data Plane (RAG Pipeline)
**Objective:** Build the brain of the chatbot – ingestion, indexing, and retrieval.

### 2.1 Vector Database Setup (Pinecone)
- [ ] Initialize Pinecone Index (`sitebot-v1`).
- [ ] Configure environment variables.

### 2.2 Scraper & Ingestion Engine
- [ ] Implement `ingestWebsite` Server Action.
- [ ] Integrate **Firecrawl API** to scrape markdown.
- [ ] Implement `RecursiveCharacterTextSplitter` (LangChain).
- [ ] Batch helper for OpenAI Embeddings (`text-embedding-3-small`).
- [ ] Upsert logic to Pinecone with metadata ` { chatbotId, url, organizationId }`.

### 2.3 Chat API & Logic
- [ ] Create `/api/chat` endpoint.
- [ ] Implement similarity search (fetch top 4 chunks).
- [ ] Construct System Prompt with Context Injection.
- [ ] Implement Streaming Response using Vercel AI SDK.
- [ ] **Verification:** Script to ingest a test URL and query Pinecone.

## Phase 3: The Embeddable Widget
**Objective:** Create the client-side JavaScript bundle for third-party sites.

### 3.1 Widget Build Pipeline
- [ ] Create strictly typed `vite.config.widget.ts`.
- [ ] Set up a separate entry point `widget/main.tsx`.
- [ ] Configure build to output a single `widget.bundle.js`.

### 3.2 Widget Implementation
- [ ] Implement Shadow DOM wrapper to isolate styles.
- [ ] Create the Chat Bubble and Chat Window UI (Preact).
- [ ] Implement API communication with CORS support.
- [ ] **Verification:** Create a local `test.html` file, embed the script, and chat with a bot.

## Phase 4: Commercialization (Stripe)
**Objective:** Monetize the platform with subscriptions.

### 4.1 Stripe Setup
- [ ] Configure Stripe Products (Hobby, Pro).
- [ ] Set up Stripe CLI for local webhook forwarding.

### 4.2 Checkout Flow
- [ ] Create `/api/stripe/checkout` endpoint.
- [ ] Implement UI for "Upgrade Plan".

### 4.3 Webhook Handling
- [ ] Create `/api/webhooks/stripe` endpoint.
- [ ] Handle `checkout.session.completed` -> Update `profiles` (billing_status: 'pro').
- [ ] Handle `customer.subscription.deleted`.

### 4.4 Usage Enforcement
- [ ] Implement Gatekeeper logic at Server Action level.
- [ ] Check limits (Chatbot count, Pages per scrape) before execution.

## Phase 5: Production Polish
- [ ] Final comprehensive E2E test (Auth -> Create -> Ingest -> Embed -> Chat).
- [ ] Optimization (Font loading, Image optimization).
- [ ] SEO metadata configuration.
