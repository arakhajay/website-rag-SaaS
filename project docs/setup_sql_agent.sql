-- Run this query in your Supabase SQL Editor to enable the SQL Agent capabilities.
create or replace function exec_sql(query text) returns json as $$
declare result json;
begin -- Execute the query and return the result as a JSON array
execute 'select json_agg(t) from (' || query || ') t' into result;
-- Return empty array if null
if result is null then result := '[]'::json;
end if;
return result;
end;
$$ language plpgsql security definer;