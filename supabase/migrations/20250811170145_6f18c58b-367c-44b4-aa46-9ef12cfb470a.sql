-- Fix migration with idempotent policy creation

-- Table
create table if not exists public.kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'submitted',
  document_path text not null,
  encrypted boolean not null default true,
  encryption_iv text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kyc_verifications enable row level security;

-- Policies for kyc_verifications
drop policy if exists "Users can insert their own KYC" on public.kyc_verifications;
drop policy if exists "Users can view their own KYC" on public.kyc_verifications;
drop policy if exists "Admins can view all KYC" on public.kyc_verifications;
drop policy if exists "Admins can update all KYC" on public.kyc_verifications;

create policy "Users can insert their own KYC"
  on public.kyc_verifications for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own KYC"
  on public.kyc_verifications for select
  using (auth.uid() = user_id);

create policy "Admins can view all KYC"
  on public.kyc_verifications for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Admins can update all KYC"
  on public.kyc_verifications for update
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS kyc_verifications_set_updated_at ON public.kyc_verifications;
create trigger kyc_verifications_set_updated_at
before update on public.kyc_verifications
for each row execute function public.update_updated_at_column();

-- Storage bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'kyc-docs'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-docs', 'kyc-docs', false);
  END IF;
END$$;

-- Storage policies
drop policy if exists "Users can upload their own KYC docs" on storage.objects;
drop policy if exists "Users can read their own KYC docs" on storage.objects;
drop policy if exists "Admins can read all KYC docs" on storage.objects;
drop policy if exists "Admins can delete KYC docs" on storage.objects;

create policy "Users can upload their own KYC docs"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc-docs' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc-docs' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins can read all KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc-docs' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "Admins can delete KYC docs"
  on storage.objects for delete
  using (
    bucket_id = 'kyc-docs' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
