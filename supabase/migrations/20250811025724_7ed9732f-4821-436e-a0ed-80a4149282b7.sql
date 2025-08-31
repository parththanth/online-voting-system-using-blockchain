
-- 1) Ensure complete row images for realtime on key tables
ALTER TABLE public.users SET (REPLICA IDENTITY FULL);
ALTER TABLE public.votes SET (REPLICA IDENTITY FULL);
ALTER TABLE public.face_enrollment SET (REPLICA IDENTITY FULL);
ALTER TABLE public.security_alerts SET (REPLICA IDENTITY FULL);
ALTER TABLE public.audit_logs SET (REPLICA IDENTITY FULL);
ALTER TABLE public.voting_schedule SET (REPLICA IDENTITY FULL);
ALTER TABLE public.face_verification_attempts SET (REPLICA IDENTITY FULL);

-- 2) Add tables to the supabase_realtime publication (safe if already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.face_enrollment;
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voting_schedule;
ALTER PUBLICATION supabase_realtime ADD TABLE public.face_verification_attempts;

-- 3) Add district to users to enable regional analytics (nullable and safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='users' AND column_name='district'
  ) THEN
    ALTER TABLE public.users ADD COLUMN district text;
    CREATE INDEX IF NOT EXISTS idx_users_district ON public.users(district);
  END IF;
END
$$;

-- 4) Helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_party ON public.votes(party_id);
CREATE INDEX IF NOT EXISTS idx_votes_timestamp ON public.votes("timestamp");
CREATE INDEX IF NOT EXISTS idx_security_alerts_timestamp ON public.security_alerts("timestamp");
