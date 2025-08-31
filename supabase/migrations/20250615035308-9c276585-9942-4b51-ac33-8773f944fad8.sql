
-- Create custom types for roles and alert types
CREATE TYPE user_role AS ENUM ('voter', 'admin');
CREATE TYPE alert_type AS ENUM ('otp_failure', 'face_verify_failure', 'duplicate_vote', 'suspicious_ip');

-- Users table with OTP and facial recognition support
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  otp_hash TEXT,
  otp_expires TIMESTAMP WITH TIME ZONE,
  face_embedding JSONB,
  face_verified BOOLEAN DEFAULT FALSE,
  otp_verified BOOLEAN DEFAULT FALSE,
  has_voted BOOLEAN DEFAULT FALSE,
  role user_role DEFAULT 'voter',
  failed_otp_attempts INTEGER DEFAULT 0,
  last_otp_request TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table with blockchain integration
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  party_id TEXT NOT NULL,
  party_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tx_hash TEXT UNIQUE,
  blockchain_confirmed BOOLEAN DEFAULT FALSE,
  vote_hash TEXT NOT NULL -- Hash of vote for privacy
);

-- Security alerts and logs
CREATE TABLE public.security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type alert_type NOT NULL,
  user_id UUID REFERENCES public.users(id),
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Voting schedule
CREATE TABLE public.voting_schedule (
  id INTEGER PRIMARY KEY DEFAULT 1,
  voting_start TIMESTAMP WITH TIME ZONE,
  voting_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_schedule CHECK (id = 1)
);

-- OTP rate limiting table
CREATE TABLE public.otp_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  UNIQUE(email, ip_address)
);

-- Face verification attempts for security monitoring
CREATE TABLE public.face_verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  success BOOLEAN NOT NULL,
  confidence_score DECIMAL(5,4),
  liveness_check_passed BOOLEAN,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_verification_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Only allow inserts during registration
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- Votes policies
CREATE POLICY "Users can view own votes" ON public.votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own votes" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for security alerts
CREATE POLICY "Admins can view all alerts" ON public.security_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin policies for voting schedule
CREATE POLICY "Everyone can view schedule" ON public.voting_schedule
  FOR SELECT USING (true);

CREATE POLICY "Admins can update schedule" ON public.voting_schedule
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Rate limiting policies
CREATE POLICY "Users can view own rate limits" ON public.otp_rate_limits
  FOR SELECT USING (true);

CREATE POLICY "System can manage rate limits" ON public.otp_rate_limits
  FOR ALL USING (true);

-- Face verification policies
CREATE POLICY "Users can view own attempts" ON public.face_verification_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert attempts" ON public.face_verification_attempts
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_otp_expires ON public.users(otp_expires);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_votes_tx_hash ON public.votes(tx_hash);
CREATE INDEX idx_security_alerts_timestamp ON public.security_alerts(timestamp);
CREATE INDEX idx_security_alerts_type ON public.security_alerts(type);
CREATE INDEX idx_otp_rate_limits_email ON public.otp_rate_limits(email);
CREATE INDEX idx_face_attempts_user_id ON public.face_verification_attempts(user_id);

-- Insert default voting schedule
INSERT INTO public.voting_schedule (voting_start, voting_end, is_active) 
VALUES (NOW() + INTERVAL '1 day', NOW() + INTERVAL '7 days', false);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voting_schedule_updated_at BEFORE UPDATE ON public.voting_schedule 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
