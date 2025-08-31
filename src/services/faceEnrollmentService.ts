import { supabase } from '@/integrations/supabase/client';

export interface FaceEnrollmentData {
  id: string;
  user_id: string;
  face_descriptor: number[];
  enrollment_date: string;
  enrolled_by?: string;
  is_active: boolean;
  confidence_threshold: number;
}

export const faceEnrollmentService = {
  /**
   * Enroll a user's face data
   */
  async enrollFace(
    userId: string, 
    faceDescriptor: number[], 
    enrolledBy?: string,
    confidenceThreshold: number = 0.6
  ): Promise<{ success: boolean; error?: string; data?: FaceEnrollmentData }> {
    try {
      const response = await fetch(`https://zjymowjrqidmgslauauv.supabase.co/functions/v1/face-enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqeW1vd2pycWlkbWdzbGF1YXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTg5NDksImV4cCI6MjA2NTUzNDk0OX0.Vgr0rW3Xi6eoD-hKX5R_4IeL5ABNPP0w80EUVzUAG8k`,
        },
        body: JSON.stringify({
          userId,
          faceDescriptor,
          enrolledBy,
          confidenceThreshold
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, data: result.enrollment };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error enrolling face:', error);
      return { success: false, error: 'Failed to enroll face' };
    }
  },

  /**
   * Enroll multiple face descriptors for a user (recommended)
   */
  async enrollFaceMultiple(
    userId: string,
    faceDescriptors: number[][],
    enrolledBy?: string,
    confidenceThreshold: number = 0.6
  ): Promise<{ success: boolean; error?: string; data?: FaceEnrollmentData[] }> {
    try {
      const response = await fetch(`https://zjymowjrqidmgslauauv.supabase.co/functions/v1/face-enrollment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqeW1vd2pycWlkbWdzbGF1YXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTg5NDksImV4cCI6MjA2NTUzNDk0OX0.Vgr0rW3Xi6eoD-hKX5R_4IeL5ABNPP0w80EUVzUAG8k`,
        },
        body: JSON.stringify({
          userId,
          faceDescriptors,
          enrolledBy,
          confidenceThreshold
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, data: result.enrollments };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error enrolling faces:', error);
      return { success: false, error: 'Failed to enroll faces' };
    }
  },

  /**
   * Get user's face enrollment data
   */
  async getFaceEnrollment(userId: string): Promise<FaceEnrollmentData | null> {
    try {
      const response = await fetch(
        `https://zjymowjrqidmgslauauv.supabase.co/functions/v1/face-enrollment?userId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqeW1vd2pycWlkbWdzbGF1YXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTg5NDksImV4cCI6MjA2NTUzNDk0OX0.Vgr0rW3Xi6eoD-hKX5R_4IeL5ABNPP0w80EUVzUAG8k`,
          },
        }
      );

      const result = await response.json();
      return result.enrollment || null;
    } catch (error) {
      console.error('Error fetching face enrollment:', error);
      return null;
    }
  },

  /**
   * Remove user's face enrollment
   */
  async removeFaceEnrollment(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`https://zjymowjrqidmgslauauv.supabase.co/functions/v1/face-enrollment`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqeW1vd2pycWlkbWdzbGF1YXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTg5NDksImV4cCI6MjA2NTUzNDk0OX0.Vgr0rW3Xi6eoD-hKX5R_4IeL5ABNPP0w80EUVzUAG8k`,
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Error removing face enrollment:', error);
      return { success: false, error: 'Failed to remove face enrollment' };
    }
  },

  /**
   * Get all face enrollments (admin only)
   */
  async getAllEnrollments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('face_enrollment')
        .select('*')
        .eq('is_active', true)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all enrollments:', error);
      return [];
    }
  }
};