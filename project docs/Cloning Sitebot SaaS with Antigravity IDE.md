# **Comprehensive Architectural Blueprint for Autonomous SaaS Development: Cloning Sitebot via Google Antigravity**

## **1\. Executive Summary**

The paradigm of software engineering is undergoing a fundamental transformation, shifting from a manual, syntax-focused discipline to an agentic, orchestration-based practice. This report provides an exhaustive architectural blueprint for cloning "Sitebot"—a highly sophisticated SaaS platform that enables users to generate custom AI chatbots trained on their own website data—using **Google Antigravity**, the newly emergent agent-first Integrated Development Environment (IDE).  
The objective of this analysis is to define a production-grade technology stack, cloud infrastructure, and execution strategy that leverages Antigravity’s autonomous agents to minimize human coding effort while maximizing architectural robustness. By utilizing Antigravity's "Mission Control" interface, we transition the developer's role from writing boilerplate code to defining high-level objectives through "Magic Prompts." The report details the implementation of critical features including Google Authentication via Supabase, a complex Retrieval-Augmented Generation (RAG) pipeline utilizing Pinecone and Firecrawl, a secure embeddable chat widget using Shadow DOM technology, and a multi-tiered subscription model powered by Stripe.  
This document is structured to serve as both a strategic white paper and a tactical implementation manual. It explores the nuances of the "Agent-First" era, where the IDE is no longer just a text editor but a platform for managing asynchronous AI workers capable of planning, executing, and verifying software tasks. The resulting Sitebot clone will not only replicate existing functionality but will be architected with modern best practices—Next.js 15 App Router, Server Actions, and Vector Search—ensuring scalability and maintainability.

## **2\. The Agent-First Paradigm: Google Antigravity**

### **2.1 Redefining the Integrated Development Environment**

The introduction of Google Antigravity marks a pivotal divergence from traditional coding environments like Visual Studio Code or IntelliJ IDEA. While traditional IDEs enhance developer productivity through autocomplete and linting, they fundamentally rely on the human as the primary driver of logic and execution. Antigravity, conversely, introduces an "agent-first" product form factor. It presupposes that the Artificial Intelligence (AI) is an autonomous actor capable of managing complex engineering workflows with minimal human intervention.  
This shift is operationalized through a bifurcated user interface. The **Editor View** retains the familiar ergonomics of a code editor for synchronous, low-level adjustments. However, the **Manager View**—often referred to as "Mission Control"—introduces a new abstraction layer. Here, developers do not manipulate files directly; rather, they orchestrate "Agents" (powered by Gemini 3 Pro or Claude Sonnet 4.5) to execute high-level tasks such as "Refactor the billing API" or "Generate a test suite for the authentication module". This architecture allows for asynchronous parallelism; a developer can dispatch multiple agents to work on distinct feature sets simultaneously, multiplying throughput in a way that linear, chat-based coding assistants cannot.

### **2.2 The Four Tenets of Collaborative Development**

To understand how to effectively prompt Antigravity to build a complex SaaS like Sitebot, one must internalize its four core design tenets: Trust, Autonomy, Feedback, and Self-Improvement.  
**Trust through Artifacts:** unlike "black box" code generators, Antigravity agents produce verifiable "Artifacts"—structured deliverables such as Task Lists, Implementation Plans, and Browser Recordings. For a critical system like a payment gateway, the ability to review a generated Implementation Plan *before* code is written is essential for ensuring security and compliance.  
**Autonomy in Execution:** Antigravity agents are not passive text generators; they possess tool-use capabilities. They can execute terminal commands, manage file systems, and significantly, control a headless browser. This capability is critical for the Sitebot project, as it allows the agent to autonomously verify that the scraped data from a user's website is correctly populating the vector database.  
**Feedback Loops:** The platform supports "Google-doc-style" comments on Artifacts. If an agent proposes a database schema that lacks a necessary index, the developer can leave a comment directly on the plan, and the agent will revise its strategy without restarting the entire context.  
**Self-Improvement:** Agents maintain a persistent knowledge base, learning from past interactions. This implies that as the Sitebot project evolves, the agents becomes more attuned to the specific architectural patterns (e.g., Shadcn UI component structures) preferred by the user.

## **3\. System Architecture and Technology Stack**

The selection of the technology stack for the Sitebot clone is driven by three factors: compatibility with modern "AI-native" development workflows, scalability for handling high-concurrency RAG workloads, and the availability of extensive training data for the LLMs powering Antigravity.

### **3.1 The Full-Stack Framework: Next.js 15**

Next.js 15 (App Router) serves as the backbone of the application. Its adoption of React Server Components (RSC) allows for a unified architecture where the frontend and backend logic coexist seamlessly. This reduction in context switching is particularly advantageous for AI agents, as they can reason about the entire data flow—from the database query in a Server Action to the UI rendering—within a single repository context.  
The App Router's directory-based routing simplifies the implementation of multi-tenancy. Routes such as /dashboard/\[orgId\]/chatbots are intuitive for agents to scaffold. Furthermore, the robust support for TypeScript ensures that the code generated by Antigravity is type-safe, reducing the class of runtime errors that are common in dynamically typed languages.

### **3.2 The Data Persistence Layer: Supabase**

For the database layer, Supabase is selected over a raw PostgreSQL instance or other Backend-as-a-Service (BaaS) providers. Supabase offers a suite of tools—PostgreSQL database, Authentication, Realtime subscriptions, and Storage—that are tightly integrated.  
**Authentication:** The requirement for "Google Auth" is natively handled by Supabase Auth. This creates a secure, compliant identity layer without requiring the agent to implement complex OAuth handshakes or session management logic manually. The integration with Next.js middleware allows for robust route protection at the edge.  
**Vector Storage:** The RAG pipeline requires a high-performance vector database. While Supabase offers pgvector, we opt for **Pinecone** for the production architecture. Pinecone’s managed service provides specialized indexing algorithms and low-latency retrieval capabilities that are critical for a "chat with your data" application. It decouples the compute-heavy vector search from the transactional relational database, ensuring that heavy query loads do not degrade the performance of the dashboard.

### **3.3 The Intelligence Layer: LangChain and OpenAI**

To orchestrate the complex logic of retrieving context and generating responses, **LangChain.js** is utilized. It abstracts the nuances of prompt engineering and context window management, providing a standard interface for the AI agents to work with.  
**LLM Provider:** **OpenAI** (specifically gpt-4o for reasoning and text-embedding-3-small for vectorization) is the industry standard. Its predictable behavior and high throughput make it the ideal choice for the underlying intelligence of the Sitebot. The text-embedding-3-small model offers a significant cost-performance advantage, which is crucial for the "free tier" of the SaaS.  
**Scraping Engine:** **Firecrawl** is integrated to handle the ingestion of user websites. Unlike generic scrapers, Firecrawl is optimized to return clean Markdown, stripping away navigation bars, footers, and ads that confuse RAG pipelines. This ensures high-quality data ingestion with minimal post-processing logic.

### **3.4 The Payment Infrastructure: Stripe**

**Stripe** provides the comprehensive billing infrastructure required for monthly and yearly subscriptions. The architecture will utilize Stripe Checkout for the payment interface (reducing PCI compliance burden) and Stripe Customer Portal for subscription management. Webhooks will be employed to synchronize subscription status with the Supabase database in real-time.

### **3.5 Infrastructure Summary Table**

| Component | Technology Selection | Rationale for Antigravity Compatibility |
| :---- | :---- | :---- |
| **Frontend Framework** | Next.js 15 (App Router) | Strong typing (TS) aids AI reasoning; Server Actions simplify backend logic. |
| **Styling System** | Tailwind CSS \+ Shadcn UI | Component-based architecture is highly predictable for AI generation. |
| **Database** | Supabase (PostgreSQL) | Native Auth integration and SQL generation capabilities of LLMs. |
| **Vector Database** | Pinecone | Managed infrastructure reduces DevOps overhead for the agent. |
| **LLM Orchestration** | LangChain.js | Standardized interfaces for RAG pipelines. |
| **Scraping Engine** | Firecrawl | API-first design simplifies the ingestion logic for the agent. |
| **Payments** | Stripe | Extensive documentation and standardized API patterns. |
| **Hosting** | Vercel | Seamless integration with Next.js; Zero-DevOps deployment. |

## **4\. Architectural Deep Dive: The Data Plane (RAG Pipeline)**

The core value proposition of Sitebot lies in its ability to accurately answer questions based on specific website content. This requires a robust Data Plane responsible for ingestion, processing, and retrieval.

### **4.1 Ingestion and Scraping Strategy**

The ingestion workflow begins when a user enters a URL into the dashboard. The Antigravity agent must implement a reliable asynchronous job to handle this, as scraping can take minutes.  
**Mechanism:** The system calls the Firecrawl API to crawl the target URL and its subpages. Firecrawl returns the content in Markdown format. The agent must implement error handling to manage rate limits and 403 Forbidden errors (common with anti-bot protections). In scenarios where Firecrawl is insufficient, a fallback using **Puppeteer** on a serverless function (via specialized providers like Browserless.io) is architected.

### **4.2 Chunking and Embedding**

Once the raw text is retrieved, it must be "chunked" into semantically meaningful segments. A naive split by character count often breaks context. The agent will be instructed to use a RecursiveCharacterTextSplitter from LangChain, configured with a chunk size of 1000 tokens and an overlap of 200 tokens. This overlap ensures that context is preserved across boundaries.  
These chunks are then passed to OpenAI's text-embedding-3-small model to generate 1536-dimensional vectors. The Antigravity agent must implement a batching strategy (e.g., processing 100 chunks at a time) to avoid hitting API payload limits.

### **4.3 Vector Storage and Retrieval**

The vectors are upserted into Pinecone. Crucially, the data architecture must support multi-tenancy. This is achieved through **Namespacing** or **Metadata Filtering**. Each vector is tagged with a chatbot\_id and organization\_id. During retrieval, the search query explicitly filters by these IDs to ensure that data does not leak between customers—a critical security requirement that the agent's implementation plan must verify.

## **5\. Architectural Deep Dive: The Edge Plane (Chat Widget)**

The "Chat Widget" is a piece of JavaScript code that Sitebot users embed on their own websites. It represents the "Edge Plane" of the architecture, running in the hostile environment of third-party browsers.

### **5.1 Isolation via Shadow DOM**

A common challenge with embeddable widgets is "CSS bleeding," where the host site's styles inadvertently affect the widget (e.g., a global p { color: white; } rule making chat text invisible). To mitigate this, the Antigravity agent must architect the widget using the **Shadow DOM** standard. This creates an encapsulated DOM tree that is immune to external styles.

### **5.2 Bundle Optimization**

The widget must be extremely lightweight to avoid slowing down the client's website. The agent should be instructed to build the widget using **Preact** (a 3KB alternative to React) or Vanilla JavaScript, bundled using Vite. The build pipeline should produce a single .js file that acts as a loader, asynchronously fetching the main application logic only when the user interacts with the chat bubble.

### **5.3 Communication Protocol**

The widget communicates with the Sitebot backend (/api/chat) via standard HTTP requests. For security, the backend must implement Cross-Origin Resource Sharing (CORS) policies that allow requests from the specific domains authorized by the user in the dashboard. The widget script itself typically utilizes an iframe for the actual chat interface to further enhance security and isolation, communicating with the host page via the window.postMessage API.

## **6\. Architectural Deep Dive: Monetization (Stripe)**

The economic engine of the SaaS is the subscription model. The architecture must support seamless upgrading, downgrading, and cancellation.

### **6.1 Product Modeling**

The agent must script the creation of two core products in Stripe:

1. **Hobby Plan:** Priced at $19/month. Limits: 1 Chatbot, 500 messages/month, 1,000 scraped pages.  
2. **Pro Plan:** Priced at $49/month. Limits: 5 Chatbots, 2,000 messages/month, 5,000 scraped pages.

### **6.2 Webhook Orchestration**

The synchronization between Stripe and Supabase is handled via webhooks. The Antigravity agent will be tasked with implementing a secure webhook handler at /api/webhooks/stripe. This handler must:

* Verify the Stripe signature to prevent spoofing.  
* Handle checkout.session.completed to provision new subscriptions.  
* Handle customer.subscription.updated to reflect plan changes.  
* Handle customer.subscription.deleted to revoke access immediately upon cancellation.  
* Handle invoice.payment\_failed to trigger a "dunning" email sequence (via an integration like Resend).

### **6.3 Usage Metering**

To enforce plan limits, the architecture requires a metering middleware. Every time a chat request is received at /api/chat, the system checks a usage\_logs table in Supabase. If the count for the current billing period exceeds the plan limit, the API returns a 402 Payment Required error, and the widget displays a polite "Limit Reached" message.

## **7\. The Magic Prompt Framework**

The success of using Antigravity lies in the precision of the prompt engineering. A vague request yields generic code. A "Magic Prompt" is a structured specification that constrains the agent's solution space to the desired architecture. We define a master prompt framework that drives the "Mission Control" workflow.

### **7.1 The Master Prompt**

This prompt is designed to be pasted into the Antigravity Manager View to initiate the project.  
**PROJECT:** Sitebot SaaS Clone **ROLE:** Principal Cloud Architect & Senior Full-Stack Engineer **OBJECTIVE:** Architect and implement a production-ready, multi-tenant SaaS platform where users can create AI chatbots trained on their website content.  
**CORE TECH STACK:**

* **Framework:** Next.js 15 (App Router, TypeScript, Server Actions).  
* **Auth:** Supabase Auth (Google OAuth \+ Email/Password).  
* **Database:** Supabase PostgreSQL (Schema: public).  
* **Vector DB:** Pinecone (Index: sitebot-v1).  
* **AI:** LangChain.js, OpenAI (gpt-4o, text-embedding-3-small).  
* **Payments:** Stripe (Checkout & Customer Portal).  
* **Styling:** Tailwind CSS, Shadcn UI, Lucide React.  
* **Deployment:** Vercel.

**PHASE 1: AUTHENTICATION & SCAFFOLDING**

* Initialize the Next.js app with the specified stack.  
* Implement Supabase SSR Auth. Create a comprehensive auth-components library.  
* **Requirement:** Create a Postgres trigger on auth.users to automatically sync new users to a public.profiles table with fields: id, email, full\_name, avatar\_url, billing\_status.  
* **Google Auth:** Configure the signInWithOAuth method for Google. Provide the callback route logic to handle the code exchange securely.

**PHASE 2: THE RAG PIPELINE (THE BRAIN)**

* Create a server action ingestWebsite(url: string, chatbotId: string).  
* **Scraping:** Use Firecrawl API to retrieve markdown content. Handle errors gracefully.  
* **Chunking:** Use RecursiveCharacterTextSplitter (chunk: 1000, overlap: 200).  
* **Embedding:** Batch embed chunks using text-embedding-3-small.  
* **Storage:** Upsert to Pinecone. Metadata MUST include: { chatbotId, url, chunkIndex, organizationId }.  
* **Chat API:** Create /api/chat. It must accept { messages, chatbotId }. Perform a vector similarity search (top 4 results), construct a system prompt injecting this context, and stream the response using the Vercel AI SDK.

**PHASE 3: THE EMBEDDABLE WIDGET**

* Create a standalone build script (using Vite) to output a widget.bundle.js.  
* **Architecture:** Use shadow-dom to isolate styles. The widget should verify the data-chatbot-id attribute.  
* **UI:** A floating button (bottom-right) that expands into a chat interface. Use Preact for minimal bundle size.  
* **Security:** Implement CORS on the backend to allow requests from the widget.

**PHASE 4: SUBSCRIPTIONS (STRIPE)**

* Create a script to seed Stripe Products: "Hobby" ($19/mo) and "Pro" ($49/mo).  
* **Checkout:** Create /api/stripe/checkout that creates a session and redirects.  
* **Webhooks:** Implement a robust handler at /api/webhooks/stripe. It MUST handle: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted.  
* **Database:** Update the profiles table with stripe\_customer\_id, plan\_id, and subscription\_status.

**EXECUTION PROTOCOL:**

1. **Plan First:** Before writing any code, generate a detailed IMPLEMENTATION\_PLAN.md artifact for my review.  
2. **Verify:** After implementing Auth, use the Browser Control to sign up a test user. Record the session.  
3. **Test:** Create a test script that ingests https://example.com and asserts that vectors are present in Pinecone.

### **7.2 Prompting Strategy Analysis**

This prompt leverages several advanced Antigravity capabilities:

* **Role Assumption:** By defining the role as "Principal Architect," we bias the model towards cleaner, more modular code structures.  
* **Explicit Constraints:** Specifying libraries (Shadcn, Preact) prevents the agent from "hallucinating" or choosing outdated dependencies.  
* **Artifact Requests:** Explicitly asking for an IMPLEMENTATION\_PLAN.md forces the agent to reason through the system design before committing code, allowing the developer to catch architectural flaws early.  
* **Verification Directives:** Instructing the agent to "use Browser Control" transforms the IDE from a passive editor to an active testing agent, verifying the "Google Auth" flow end-to-end.

## **8\. Detailed Implementation Lifecycle**

This section provides a chronological guide to building the application, detailing the specific interactions with the Antigravity Agent Manager at each stage.

### **8.1 Phase 1: Foundation and Identity**

The initial phase focuses on establishing a secure perimeter. The Antigravity agent is tasked with scaffolding the Next.js application and implementing the authentication layer.  
**Database Schema Design:** The agent should be directed to produce a SQL schema artifact. For Sitebot, the schema must be robust:  
`-- Profiles table (synced with auth)`  
`create table profiles (`  
  `id uuid references auth.users not null primary key,`  
  `email text,`  
  `full_name text,`  
  `billing_status text default 'free',`  
  `stripe_customer_id text,`  
  `created_at timestamp with time zone default timezone('utc'::text, now())`  
`);`

`-- Chatbots table`  
`create table chatbots (`  
  `id uuid default uuid_generate_v4() primary key,`  
  `user_id uuid references profiles(id) not null,`  
  `name text not null,`  
  `base_url text not null,`  
  `theme_color text default '#000000',`  
  `created_at timestamp with time zone default timezone('utc'::text, now())`  
`);`

**Google Auth Implementation:** The agent will generate the route.ts for the auth callback. A key detail often missed is the handling of the code\_verifier for PKCE (Proof Key for Code Exchange) flows, which is standard in Supabase SSR. The agent's generated code must securely exchange the auth code for a session cookie.  
**Verification:** Using the **Browser Subagent**, the agent navigates to the localhost login page, clicks "Sign in with Google," and validates that the browser is redirected to the dashboard. It captures a screenshot of the dashboard as an artifact.

### **8.2 Phase 2: The Dashboard and User Experience**

With identity established, the focus shifts to the dashboard—the control center for the user.  
**UI Generation:** Leveraging the "Shadcn UI" constraint, the agent generates high-quality React components. The "Create Chatbot" modal is a critical flow. The agent constructs a form that accepts a URL, triggering the ingestion process.  
**State Management:** For managing the complex state of the dashboard (e.g., the list of chatbots, their sync status), the agent may implement **Zustand** or **TanStack Query**. TanStack Query is preferable for server state synchronization. The agent's plan should detail how it handles the "optimistic updates" when a user deletes a chatbot.

### **8.3 Phase 3: The Intelligence Engine (RAG)**

This is the most technically demanding phase.  
**The Ingestion Worker:** Ideally, scraping is a long-running background task. The agent might suggest using a service like **Inngest** or **Trigger.dev** to handle this reliably within the serverless constraints of Vercel.

* *Task:* The agent writes a job that:  
  1. Receives a chatbot\_id and url.  
  2. Calls Firecrawl.  
  3. Iterates through the pages.  
  4. Embeds and upserts.  
  5. Updates the chatbots table status from training to ready.

**The Chat Interface:** The agent generates a chat window component (chat-interface.tsx). This component must handle the *streaming* response from the API. The Vercel AI SDK (ai/react) is the standard tool here. The agent connects the useChat hook to the /api/chat endpoint, ensuring a responsive user experience where tokens appear in real-time.

### **8.4 Phase 4: The Embeddable Widget**

The agent is tasked with creating a completely separate build pipeline for the widget.  
**Technical Nuance:** The agent creates a vite.config.widget.ts configuration that outputs a generic IIFE (Immediately Invoked Function Expression) script. This script is designed to be copy-pasted.

* *Feature:* The widget code must include a "ping" to the server on load to check if the chatbot is active and allowed to run on the current domain (preventing usage abuse).

### **8.5 Phase 5: Commercialization (Stripe)**

The final phase turns the software into a business.  
**Subscription Logic:** The agent implements the checkout route. Crucially, it attaches the userId to the Stripe Session Metadata. This ensures that when the webhook fires, the system knows exactly which user to upgrade.  
**Tiered Access Control:** The agent modifies the ingestWebsite server action. Before allowing a scrape, it queries the profiles table.

* *Logic:* if (user.plan \=== 'hobby' && user.chatbot\_count \>= 1\) throw new Error("Upgrade required"); This "gatekeeper" logic is pervasive, checking limits on message sending, scraping, and team member additions.

## **9\. Operational Excellence and Security**

### **9.1 Security Considerations**

* **Row Level Security (RLS):** Supabase relies on RLS. The agent must generate policies that strictly enforce data isolation. For example: create policy "Users can only see their own chatbots" on chatbots for select using (auth.uid() \= user\_id);.  
* **API Route Protection:** All API routes (except the public chat endpoint) must verify the user session.  
* **Vector Isolation:** The Pinecone query must *always* include a metadata filter for chatbot\_id to prevent cross-contamination of context.

### **9.2 Testing Strategy**

Antigravity allows for "Agent-Driven Testing."

* **Unit Tests:** The agent generates Jest tests for the utility functions (e.g., text chunking logic).  
* **E2E Tests:** The agent uses its browser control capabilities to run through critical paths: Signup \-\> Create Bot \-\> Chat \-\> Upgrade Plan. This replaces the need for manually writing Cypress scripts in the early stages.

## **10\. Conclusion**

The "Sitebot" project, traditionally a complex undertaking requiring a team of backend, frontend, and DevOps engineers, can now be effectively cloned and deployed by a single architect using **Google Antigravity**. By leveraging the IDE's autonomous agents, the development process shifts from manual implementation to high-level orchestration.  
This blueprint has outlined a robust path to execution:

1. **Architecture:** Next.js 15 \+ Supabase provides a scalable, secure foundation.  
2. **Intelligence:** LangChain \+ Pinecone \+ Firecrawl democratizes access to advanced RAG capabilities.  
3. **Monetization:** Stripe integration converts the utility into a sustainable business model.  
4. **Execution:** The "Magic Prompt" framework empowers the Antigravity agents to build, verify, and iterate on the code with minimal human friction.

The result is not just a codebase, but a verified, production-ready SaaS platform that embodies the efficiency and capability of the Agent-First era.

## **11\. Appendix: Configuration Reference**

**Table 2: Essential Environment Variables**

| Variable | Description |
| :---- | :---- |
| NEXT\_PUBLIC\_SUPABASE\_URL | API endpoint for Supabase project. |
| NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY | Safe-to-expose key for client-side data fetching. |
| SUPABASE\_SERVICE\_ROLE\_KEY | **Secret** key for admin tasks (webhooks, user management). |
| OPENAI\_API\_KEY | Key for GPT-4o and Embedding API. |
| PINECONE\_API\_KEY | Access key for the vector database. |
| PINECONE\_INDEX | Name of the index (e.g., sitebot-prod). |
| STRIPE\_SECRET\_KEY | Secret key for initializing Stripe SDK. |
| STRIPE\_WEBHOOK\_SECRET | Secret for verifying webhook signatures. |
| FIRECRAWL\_API\_KEY | Key for the web scraping service. |

**Table 3: Subscription Plan Limits**

| Feature | Hobby Plan ($19/mo) | Pro Plan ($49/mo) |
| :---- | :---- | :---- |
| **Chatbots** | 1 | 5 |
| **Messages/mo** | 500 | 2,000 |
| **Pages/Scrape** | 50 | 500 |
| **Model** | GPT-3.5-Turbo | GPT-4o |
| **Support** | Email | Priority |

#### **Works cited**

1\. Getting Started with Google Antigravity \- Google Codelabs, https://codelabs.developers.google.com/getting-started-google-antigravity 2\. Build a subscriptions integration \- Stripe Documentation, https://docs.stripe.com/billing/subscriptions/build-subscriptions 3\. llms-full.txt \- Firecrawl, https://www.firecrawl.dev/llms-full.txt 4\. Geeksfino/finclip-agent: Customer Experience Agent with Chatbot frontend easily embeddable to any website or mobile app \- GitHub, https://github.com/Geeksfino/finclip-agent 5\. Google Antigravity Blog: introducing-google-antigravity, https://antigravity.google/blog/introducing-google-antigravity 6\. Build with Google Antigravity, our new agentic development platform, https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/ 7\. Building an App from Scratch with AI: Coding with Google Antigravity \- Callibrity, https://www.callibrity.com/articles/building-an-app-from-scratch-with-ai 8\. Antigravity Codes | 1,500+ MCP Servers, AI Rules & Workflows for Antigravity, Cursor & Windsurf, https://antigravity.codes/ 9\. Stripe & Supabase SaaS Starter Kit \- Vercel, https://vercel.com/templates/next.js/stripe-supabase-saas-starter-kit 10\. Code a Stripe Subscription Model With React and Nextjs \- ByeDispute, https://byedispute.com/blog/how-to-code-a-stripe-subscription-model-with-react-and-nextjs 11\. How to Build a RAG Chatbot with OpenAI and Web Scraping: Step-by-Step Guide \- Oxylabs, https://oxylabs.io/blog/how-to-build-a-rag-chatbot 12\. Struggling with RAG-based chatbot using website as knowledge base – need help improving accuracy \- Reddit, https://www.reddit.com/r/Rag/comments/1ks17vd/struggling\_with\_ragbased\_chatbot\_using\_website\_as/ 13\. README.md \- websyte-ai-chat-widget \- GitHub, https://github.com/WebsyteAI/websyte-ai-chat-widget/blob/main/.claude/FEATURES/README.md 14\. How do people make web embeddable widgets? : r/reactjs \- Reddit, https://www.reddit.com/r/reactjs/comments/1fkr7na/how\_do\_people\_make\_web\_embeddable\_widgets/ 15\. Build Shopify App that add chat widget to the shop \- Extensions, https://community.shopify.dev/t/build-shopify-app-that-add-chat-widget-to-the-shop/7812 16\. Pricing plans \- SiteGPT, https://sitegpt.ai/pricing