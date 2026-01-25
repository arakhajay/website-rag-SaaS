# Check APIs

**Goal**: Verify connectivity to all external services (OpenAI, Pinecone, Firecrawl, Supabase).

**Inputs**:
- Environment variables in `../sitebot/.env.local`

**Steps**:
1. Run the validation script.
2. Review the console output for ✅ or ❌.

**Execution Script**:
- `node ../execution/check-apis.js`
