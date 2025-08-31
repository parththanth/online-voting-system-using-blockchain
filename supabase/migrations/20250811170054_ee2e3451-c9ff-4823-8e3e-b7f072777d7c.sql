-- 1) KYC table for onboarding
-- Create table for KYC verifications
create table if not exists public.kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'submitted', -- submitted | pending_review | approved | rejected
  document_path text not null,
  encrypted boolean not null default true,
  encryption_iv text, -- base64 IV used for AES-GCM
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.kyc_verifications enable row level security;

-- Policies: users can insert/select their own records
create policy if not exists "Users can insert their own KYC"
  on public.kyc_verifications for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can view their own KYC"
  on public.kyc_verifications for select
  using (auth.uid() = user_id);

-- Admins can view and update all
create policy if not exists "Admins can view all KYC"
  on public.kyc_verifications for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy if not exists "Admins can update all KYC"
  on public.kyc_verifications for update
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

-- Trigger to keep updated_at fresh
create trigger kyc_verifications_set_updated_at
before update on public.kyc_verifications
for each row execute function public.update_updated_at_column();

-- 2) Create a private storage bucket for KYC documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'kyc-docs'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-docs', 'kyc-docs', false);
  END IF;
END$$;

-- 3) Storage RLS policies for kyc-docs
-- Allow users to upload files in a folder named after their user_id
create policy if not exists "Users can upload their own KYC docs"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc-docs' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read their own KYC docs
create policy if not exists "Users can read their own KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc-docs' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow admins to read all KYC docs
create policy if not exists "Admins can read all KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc-docs' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- (Optional) Allow admins to delete KYC docs if needed
create policy if not exists "Admins can delete KYC docs"
  on storage.objects for delete
  using (
    bucket_id = 'kyc-docs' and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
