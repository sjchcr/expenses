create table if not exists public.monthly_budget_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  excluded_category_ids jsonb not null default '[]'::jsonb,
  bucket_budget_overrides jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, month),
  constraint monthly_budget_overrides_month_format
    check (month ~ '^\d{4}-\d{2}$')
);

alter table public.monthly_budget_overrides
  add column if not exists bucket_budget_overrides jsonb not null default '{}'::jsonb;

alter table public.monthly_budget_overrides enable row level security;

drop policy if exists "Users can read their monthly budget overrides"
  on public.monthly_budget_overrides;
create policy "Users can read their monthly budget overrides"
  on public.monthly_budget_overrides
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their monthly budget overrides"
  on public.monthly_budget_overrides;
create policy "Users can insert their monthly budget overrides"
  on public.monthly_budget_overrides
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their monthly budget overrides"
  on public.monthly_budget_overrides;
create policy "Users can update their monthly budget overrides"
  on public.monthly_budget_overrides
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their monthly budget overrides"
  on public.monthly_budget_overrides;
create policy "Users can delete their monthly budget overrides"
  on public.monthly_budget_overrides
  for delete
  using (auth.uid() = user_id);
