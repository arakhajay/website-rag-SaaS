# Get User ID

**Goal**: Fetch a valid User ID from the Supabase `profiles` table.

**Inputs**:
- Environment variables in `../sitebot/.env.local`

**Steps**:
1. Connect to Supabase using the Anon Key.
2. Query the `profiles` table.
3. Print the first ID found.

**Execution Script**:
- `execution/node_modules/.bin/tsc execution/get-user-id.ts --esModuleInterop && node execution/get-user-id.js`
