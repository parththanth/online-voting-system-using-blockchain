-- Add sample regional voting data and districts
INSERT INTO votes (user_id, party_id, party_name, timestamp, vote_hash) VALUES 
-- District 1 votes
(gen_random_uuid(), 'PTY-001', 'Indian National Congress', NOW() - INTERVAL '1 hour', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-001', 'Indian National Congress', NOW() - INTERVAL '2 hours', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '30 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '45 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-003', 'Aam Aadmi Party', NOW() - INTERVAL '15 minutes', encode(sha256(random()::text::bytea), 'hex')),

-- District 2 votes  
(gen_random_uuid(), 'PTY-001', 'Indian National Congress', NOW() - INTERVAL '20 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '10 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '35 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-003', 'Aam Aadmi Party', NOW() - INTERVAL '50 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-005', 'None Of The Above', NOW() - INTERVAL '25 minutes', encode(sha256(random()::text::bytea), 'hex')),

-- District 3 votes
(gen_random_uuid(), 'PTY-001', 'Indian National Congress', NOW() - INTERVAL '40 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '55 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '5 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-003', 'Aam Aadmi Party', NOW() - INTERVAL '30 minutes', encode(sha256(random()::text::bytea), 'hex')),

-- District 4 votes
(gen_random_uuid(), 'PTY-001', 'Indian National Congress', NOW() - INTERVAL '12 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-001', 'Indian National Congress', NOW() - INTERVAL '28 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '18 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-003', 'Aam Aadmi Party', NOW() - INTERVAL '42 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-005', 'None Of The Above', NOW() - INTERVAL '8 minutes', encode(sha256(random()::text::bytea), 'hex')),

-- District 5 votes  
(gen_random_uuid(), 'PTY-001', 'Indian National Congress', NOW() - INTERVAL '22 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '33 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '48 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-002', 'Bharatiya Janata Party', NOW() - INTERVAL '2 minutes', encode(sha256(random()::text::bytea), 'hex')),
(gen_random_uuid(), 'PTY-003', 'Aam Aadmi Party', NOW() - INTERVAL '16 minutes', encode(sha256(random()::text::bytea), 'hex'));

-- Add sample security alerts for platform analytics
INSERT INTO security_alerts (type, user_email, user_agent, ip_address, details) VALUES
('otp_failure', 'user1@example.com', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.100', '{"attempt_count": 3}'),
('otp_failure', 'user2@example.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.101', '{"attempt_count": 2}'),
('face_verification_failure', 'user3@example.com', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0', '192.168.1.102', '{"confidence": 0.4}'),
('otp_failure', 'user4@example.com', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.103', '{"attempt_count": 1}'),
('face_verification_failure', 'user5@example.com', 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.104', '{"confidence": 0.3}'),
('otp_failure', 'user6@example.com', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '192.168.1.105', '{"attempt_count": 4}'),
('suspicious_activity', 'user7@example.com', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15', '192.168.1.106', '{"reason": "multiple_locations"}'),
('face_verification_failure', 'user8@example.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0', '192.168.1.107', '{"confidence": 0.5}');

-- Add sample users for analytics
INSERT INTO users (id, email, phone_number, face_verified, otp_verified, created_at) VALUES
(gen_random_uuid(), 'voter1@example.com', '+919876543210', true, true, NOW() - INTERVAL '2 days'),
(gen_random_uuid(), 'voter2@example.com', '+919876543211', true, true, NOW() - INTERVAL '1 day'),  
(gen_random_uuid(), 'voter3@example.com', '+919876543212', false, true, NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), 'voter4@example.com', '+919876543213', true, true, NOW() - INTERVAL '5 hours'),
(gen_random_uuid(), 'voter5@example.com', '+919876543214', true, false, NOW() - INTERVAL '6 hours'),
(gen_random_uuid(), 'voter6@example.com', '+919876543215', false, false, NOW() - INTERVAL '8 hours'),
(gen_random_uuid(), 'voter7@example.com', '+919876543216', true, true, NOW() - INTERVAL '12 hours'),
(gen_random_uuid(), 'voter8@example.com', '+919876543217', true, true, NOW() - INTERVAL '1 hour');

-- Trigger recomputation of admin metrics
SELECT public.recompute_admin_public_metrics();