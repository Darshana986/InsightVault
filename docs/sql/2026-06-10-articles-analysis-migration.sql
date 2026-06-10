-- InsightVault migration: replace legacy tldr/takeaways with analysis
-- Run this in Supabase SQL Editor.

begin;

-- 1) Add the new analysis column if missing.
alter table public.articles
add column if not exists analysis text;

-- 2) Copy existing tldr values into analysis (only where analysis is empty).
update public.articles
set analysis = tldr
where analysis is null
  and tldr is not null;

-- 3) Remove legacy columns.
alter table public.articles
drop column if exists tldr,
drop column if exists takeaways;

commit;
