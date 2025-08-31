
import { ElectionStats } from "@/types/api";

// Event callbacks
type VoteUpdateCallback = (data: ElectionStats) => void;
const eventCallbacks: Record<string, VoteUpdateCallback[]> = {
  vote_update: [],
};

// Mock election stats for simulation
const mockElectionStats: ElectionStats = {
  totalRegisteredVoters: 5000,
  totalVotesCast: 3245,
  voterTurnoutPercentage: 64.9,
  partywiseVotes: [
    {
      partyId: 'PTY-001',
      partyName: 'Progressive Alliance',
      votes: 1245,
      percentage: 38.4
    },
    {
      partyId: 'PTY-002',
      partyName: 'Conservative Union',
      votes: 987,
      percentage: 30.4
    },
    {
      partyId: 'PTY-003',
      partyName: 'Liberty Party',
      votes: 568,
      percentage: 17.5
    },
    {
      partyId: 'PTY-004',
      partyName: 'National Front',
      votes: 312,
      percentage: 9.6
    },
    {
      partyId: 'PTY-005',
      partyName: 'Unity Coalition',
      votes: 133,
      percentage: 4.1
    }
  ],
  districtWiseTurnout: [
    {
      district: 'North District',
      totalVoters: 1200,
      votesCast: 876,
      turnout: 73.0
    },
    {
      district: 'South District',
      totalVoters: 980,
      votesCast: 654,
      turnout: 66.7
    },
    {
      district: 'East District',
      totalVoters: 1100,
      votesCast: 712,
      turnout: 64.7
    },
    {
      district: 'West District',
      totalVoters: 920,
      votesCast: 543,
      turnout: 59.0
    },
    {
      district: 'Central District',
      totalVoters: 800,
      votesCast: 460,
      turnout: 57.5
    }
  ]
};

// Mock socket updates interval
let updateInterval: number | null = null;

/**
 * Initialize mock Socket connection
 */
export function initializeSocket() {
  console.log("Mock WebSocket initialized");
}

/**
 * Join an election room to receive updates
 */
export function joinElection(electionId: string = "default") {
  console.log(`Joined mock election: ${electionId}`);
  
  // Start sending mock updates periodically
  if (!updateInterval) {
    updateInterval = window.setInterval(() => {
      // Create a slightly modified copy of the mock stats
      const updatedStats = JSON.parse(JSON.stringify(mockElectionStats)) as ElectionStats;
      
      // Increase vote count slightly
      updatedStats.totalVotesCast += Math.floor(Math.random() * 5);
      updatedStats.voterTurnoutPercentage = (updatedStats.totalVotesCast / updatedStats.totalRegisteredVoters) * 100;
      
      // Update party votes
      updatedStats.partywiseVotes.forEach(party => {
        if (Math.random() > 0.5) {
          party.votes += 1;
        }
        party.percentage = (party.votes / updatedStats.totalVotesCast) * 100;
      });
      
      // Update district turnout
      updatedStats.districtWiseTurnout.forEach(district => {
        if (Math.random() > 0.5 && district.votesCast! < district.totalVoters!) {
          district.votesCast! += 1;
        }
        district.turnout = (district.votesCast! / district.totalVoters!) * 100;
      });
      
      // Call all registered callbacks with the updated stats
      eventCallbacks.vote_update.forEach(callback => callback(updatedStats));
    }, 5000); // Update every 5 seconds
  }
}

/**
 * Register callback for vote updates
 */
export function onVoteUpdate(callback: (data: ElectionStats) => void) {
  eventCallbacks.vote_update.push(callback);
  
  // Return a function to unregister the callback
  return () => {
    const index = eventCallbacks.vote_update.indexOf(callback);
    if (index !== -1) {
      eventCallbacks.vote_update.splice(index, 1);
    }
  };
}

/**
 * Close socket connection
 */
export function closeSocket() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  console.log("Mock WebSocket connection closed");
}
