# Fix Missing Dashboard Routes

**Goal**: ensure all links in the dashboard sidebar point to valid, existing pages.

**Inputs**:
- `sitebot/app/dashboard` directory structure.
- User report of 404 errors on `/dashboard/training`, `/dashboard/settings`, etc.

**Steps**:
1. Check current directory structure of `sitebot/app/dashboard`.
2. Identify missing subdirectories/pages.
3. Create minimal `page.tsx` for each missing route.
4. Verify Sidebar component links match the directory structure.
