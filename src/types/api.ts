// API response types for the VoteGuard application

// Common response structure
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Auth response with token and user info
export interface AuthResponse extends ApiResponse {
  token?: string;
  user?: {
    id: string;
    phone_number: string;
    role: string;
    face_verified: boolean;
    has_voted: boolean;
  };
  debug_otp?: string; // For development/testing purposes
}

// Voter information
export interface Voter {
  id: string;
  name: string;
  district: string;
  hasVoted: boolean;
}

// Voter verification response
export interface VoterVerificationResponse extends ApiResponse {
  voter?: Voter;
}

// Party type
export interface Party {
  id: string;
  name: string;
  symbol: string;
  color: string;
  logoPath: string;
}

// Parties response
export interface PartiesResponse extends ApiResponse {
  parties?: Party[];
}

// Vote cast response
export interface VoteCastResponse extends ApiResponse {
  transactionId?: string;
  isAdminTest?: boolean;
}

// Party vote statistics
export interface PartyVoteStats {
  partyId: string;
  partyName?: string;
  votes: number;
  percentage: number;
}

// District turnout
export interface DistrictTurnout {
  district: string;
  totalVoters?: number;
  votesCast?: number;
  turnout: number;
}

// Election statistics
export interface ElectionStats {
  totalRegisteredVoters: number;
  totalVotesCast: number;
  voterTurnoutPercentage: number;
  partywiseVotes: PartyVoteStats[];
  districtWiseTurnout: DistrictTurnout[];
}

// Admin Stats Response
export interface AdminStatsResponse {
  stats: {
    totalRegisteredVoters: number;
    totalVotesCast: number;
    voterTurnoutPercentage: number;
    activePollingStations: number;
    activePollingStationsPercentage: number;
    recentChange: number;
    partywiseVotes: {
      partyId: string;
      partyName: string;
      votes: number;
      percentage: number;
    }[];
    demographicBreakdown?: {
      ageGroups: {
        group: string;
        votes: number;
        percentage: number;
      }[];
      gender: {
        type: string;
        votes: number;
        percentage: number;
      }[];
    };
    securityIncidents?: {
      total: number;
      byType: {
        facialVerificationFailure: number;
        duplicateVoteAttempt: number;
        unauthorizedAccess: number;
      };
      resolved: number;
      pending: number;
    };
  };
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'facial-verification' | 'duplicate-vote' | 'unauthorized-access' | 'session-timeout';
  status: 'failed' | 'blocked' | 'warning';
  voter: string;
  voterID: string;
  location: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface VotingSchedule {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notifications: boolean;
  status: 'upcoming' | 'active' | 'completed';
}
