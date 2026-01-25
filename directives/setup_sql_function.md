# Setup SQL Execution Function

**Goal**: Enable the Sitebot AI to run SQL queries against your database for the "Text-to-SQL" features.

**Why?**: The standard Supabase client cannot run arbitrary SQL (like `SELECT sum(sales) FROM csv_data...`). We need a trusted function (`RPC`) to do this.

**Steps**:

1.  Open your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Go to the **SQL Editor**.
3.  New Query: Paste the following code:

```sql
create or replace function exec_sql(query text)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  execute 'select json_agg(t) from (' || query || ') t' into result;
  return result;
end;
$$;
```

4.  **Run** the query.

**Security Warning**: This function allows any user with access to call it (via the API) to run ANY query.
For production, you MUST restrict who can call this function using RLS or grant execution only to the `service_role`.

To restrict to service role only (recommended for this agentic workflow):
```sql
revoke execute on function exec_sql(text) from public, anon, authenticated;
grant execute on function exec_sql(text) to service_role;
```
