-- Add import/claim fields to profiles
alter table public.profiles
  add column email text,
  add column is_claimed boolean default false not null,
  add column imported_by uuid references public.users(id),
  add column claim_token uuid default gen_random_uuid();

-- Unique index so each profile has one claim token
create unique index profiles_claim_token_idx on public.profiles(claim_token);

-- Allow authenticated users to claim unclaimed profiles
create policy "Authenticated users can claim unclaimed profiles" on public.profiles
  for update using (is_claimed = false)
  with check (auth.role() = 'authenticated');
