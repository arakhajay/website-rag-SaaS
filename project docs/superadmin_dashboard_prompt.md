System Role / Context: You are a Senior Full-Stack Engineer expert in Next.js 16 (App Router), Supabase (Auth & Database), and Tailwind/Shadcn UI. We are building the Super Admin Dashboard for an existing SaaS application ("SiteBot").

Objective: Create a secured /admin route with a comprehensive dashboard layout that allows me (the owner) to manage users, credits, and system usage.

1. Security & Infrastructure (First Priority)
Database Schema: logic to add a role column (text, default 'user', check constraint in ('user', 'super_admin')) to the existing profiles table.
Middleware Protection: Update 

middleware.ts
 to strictly protect /admin/**/*. If a user is not authenticated OR their role is not super_admin, redirect them immediately to /dashboard or 404.
Row Level Security (RLS): Ensure RLS policies allow super_admin users to Select, Update, and Delete rows in any table (profiles, chatbots, usage_stats) regardless of ownership.
2. Admin Dashboard Layout
Create a dedicated layout app/admin/layout.tsx with a distinct sidebar (separate from the user dashboard) containing:
Overview (Global Stats)
Users (Tenant Management)
Chatbots (Global Content View)
System Health (Logs/Errors)
3. Feature Implementation
A. Global Overview Page (/admin/page.tsx)
Display 4 top-level "stat cards" summarizing the entire business:
Total Users (Active vs Inactive)
Total Chatbots Created
Total System-wide OpenAI Usage (Token count/approximate cost)
Total Revenue (Placeholder for now, or sum of credits purchased)
Include a "Recent Signups" list showing the last 5 users.
B. User Management Console (/admin/users)
Data Table: A searchable, sortable shadcn/ui table listing all users.
Columns: Email, Sign-up Date, Plan Type, Credits Remaining, Chatbots Count, Status (Active/Banned).
Action Menu (per user):
"Edit Credits": A modal to manually Add/Remove Message Credits or Training Char limits (e.g., "Compensate 500 credits").
"Change Plan": A dropdown to forcibly upgrade/downgrade their tier (Free -> Pro).
"Ban User": A toggle to disable their login.
Impersonation / "God Mode": Add a "View As" button. When clicked, setting a cookie or state that lets me browse the /dashboard as if I were that user, seeing exactly their chatbots and data to debug issues.
C. Backend Actions
Create app/actions/admin-users.ts:
getGlobalStats(): Aggregated SQL queries.
adminUpdateUserCredits(userId, amount): Transactional update.
adminBanUser(userId): Updates auth status.
Requirements
Aesthetics: Use a slightly different color theme (e.g., a subtle red or purple accent) for the Admin layouts so I instantly know I am in "Admin Mode" and not "User Mode".
Performance: Use Server Components for fetching all lists.
Safety: Ensure that admin actions are wrapped in strictly typed server actions that re-verify the caller is a super_admin before executing (Double-check security).
Output: Please generate the step-by-step implementation plan, starting with the SQL migrations, then the middleware updates, and finally the page components.

