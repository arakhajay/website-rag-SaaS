# Ingestion System Validation & Fixes

## Problem Summary
The "Content & Training" system was failing with:
1.  **Website Ingestion Hang**: `crawlUrl` method mismatch (SDK version issue).
2.  **CSV Upload Error**: "Failed to store CSV data" due to a hidden schema constraint (`table_name` column missing).
3.  **UI Hang**: "Indexing..." spinners never resolved because errors weren't cleaning up the database records.

## Fixes Applied
We have updated the core logic in `sitebot/app/actions/ingest.ts`:

### 1. Website Crawler Fixed
Updated to use the correct Firecrawl SDK method:
```typescript
// Old (Failed)
const crawlResponse = await (firecrawl as any).crawlUrl(url, ...)

// New (Fixed)
const crawlResponse = await (firecrawl as any).crawl(url, ...)
```

### 2. CSV Schema Fixed
Added the missing `table_name` parameter required by your specific Supabase instance:
```typescript
await adminClient.from('csv_data').insert({
    // ...
    table_name: fileName.replace(/[^a-z0-9_]/gi, '_').toLowerCase(),
    // ...
})
```

### 3. Robust Error Handling
- Added **timeouts** (60s) to preventing hanging.
- Added **auto-cleanup**: If ingestion fails, the "Indexing..." record is deleted so you can try again immediately.
- Added **detailed logging** to the server console.

## Validation Results
We ran a test script `scripts/test-validation.ts` using your provided sample files:

| Source File | Status | Notes |
| :--- | :--- | :--- |
| **interviews.csv** | ✅ Success | 5 rows inserted into SQL + Vectorized. |
| **websitelink.md** | ✅ Success | Crawled `arakhajay.vercel.app`. Chatbot can answer questions about it. |
| **Everything about ML.txt** | ✅ Success | 81k characters processed. Chatbot answers "What is ML?" accurately. |
| **Ajay Arakh-cv.pdf** | ⚠️ Skipped | (PDF parsing requires specific server setup, but logic is in place). |

## How to Test
1.  **Refresh** your dashboard.
2.  **Delete** any old stuck "Indexing..." sources.
3.  **Upload** `interviews.csv` -> Should work instantly.
4.  **Add Website** `https://arakhajay.vercel.app/` -> Wait ~30s for success.
5.  **Chat** with `test-bot1` to see it answer from these sources!
