
import { apiRequest } from './api';
import { AdminStatsResponse, SecurityLog, VotingSchedule } from '@/types/api';

export const adminService = {
  /**
   * Get admin dashboard statistics
   */
  getStats: async (): Promise<AdminStatsResponse> => {
    return await apiRequest<AdminStatsResponse>('admin-stats', {}, true);
  },
  
  /**
   * Get security logs
   */
  getLogs: async (limit: number = 50, offset: number = 0, type?: string): Promise<{
    success: boolean;
    logs: SecurityLog[];
    total: number;
  }> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    if (type) {
      params.append('type', type);
    }
    
    return await apiRequest<{
      success: boolean;
      logs: SecurityLog[];
      total: number;
    }>('admin-logs?' + params.toString(), {}, true);
  },
  
  /**
   * Get voting schedule
   */
  getSchedule: async (): Promise<{
    success: boolean;
    schedules: VotingSchedule[];
  }> => {
    return await apiRequest<{
      success: boolean;
      schedules: VotingSchedule[];
    }>('admin-schedule', {}, true);
  }
};
