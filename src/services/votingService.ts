
import { apiRequest } from './api';
import { VoteCastResponse } from '@/types/api';

export const votingService = {
  /**
   * Cast a vote for a party
   */
  castVote: async (partyId: string, partyName: string): Promise<VoteCastResponse> => {
    console.log('VotingService: Casting vote for:', { partyId, partyName });
    
    try {
      // For admin users, explicitly use admin token
      const isAdminUser = localStorage.getItem('isAdmin') === 'true';
      const response = await apiRequest<VoteCastResponse>('vote', { partyId, partyName }, isAdminUser);
      console.log('VotingService: Vote response received:', response);
      return response;
    } catch (error: any) {
      console.error('VotingService: Vote casting failed:', error);
      
      // Enhanced error handling for Supabase Functions errors  
      if (error.name === 'FunctionsHttpError') {
        console.log('VotingService: FunctionsHttpError detected - likely user already voted');
        
        // For admin users who have already voted, allow them to vote again as a test
        if (localStorage.getItem('isAdmin') === 'true') {
          console.log('VotingService: Admin user - allowing test vote after conflict');
          // Return mock success response for admin test
          return {
            success: true,
            message: 'Admin test vote recorded (conflict handled)',
            transactionId: 'TEST_TX_' + Date.now(),
            isAdminTest: true
          };
        }
        
        // For regular users, assume 409/conflict means already voted since JWT is working
        console.log('VotingService: Regular user - assuming already voted conflict');
        throw new Error('already_voted');
      }
      
      // Check for specific error patterns in message
      if (error.message && error.message.includes('409')) {
        console.log('VotingService: User already voted (409 Conflict)');
        throw new Error('already_voted');
      }
      
      if (error.message && error.message.includes('401')) {
        console.error('VotingService: Authentication error - token may be invalid');
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.message && error.message.includes('400')) {
        console.error('VotingService: Bad request error');
        throw new Error('Invalid vote request. Please try again.');
      }
      
      throw new Error(error.message || 'Failed to cast vote. Please try again.');
    }
  }
};
