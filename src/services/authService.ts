
import { apiRequest, setAuthToken, setAdminToken, removeAuthToken, removeAdminToken } from './api';
import { AuthResponse, VoterVerificationResponse } from '@/types/api';

export const authService = {
  /**
   * Request OTP for voter authentication via phone
   */
  requestOTP: async (phoneNumber: string): Promise<AuthResponse> => {
    try {
      const response = await apiRequest<AuthResponse>('auth-request-otp', { phoneNumber });
      console.log('AuthService: OTP request response:', response);
      return response;
    } catch (error: unknown) {
      console.error('AuthService: OTP request failed:', error);
      
      // Supabase Functions error shape
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const err = error as { message?: string; name?: string; context?: unknown };
        // If FunctionsHttpError, try to extract context
        if (err.name === 'FunctionsHttpError' && err.context && typeof err.context === 'object') {
          const ctx = err.context as Record<string, unknown>;
          const serverMsg = (ctx.error as string) || (ctx.message as string);
          if (serverMsg) {
            return { success: false, error: serverMsg };
          }
        }
        // Parse stringified JSON message
        if (typeof err.message === 'string') {
        try {
          const errorData = JSON.parse(err.message);
          return {
            success: false,
            error: errorData.error || 'Failed to send OTP'
          };
        } catch (parseError) {
          // If JSON parsing fails, return the original error message
          return {
            success: false,
            error: err.message || 'Failed to send OTP'
          };
        }
      }
      
      return {
        success: false,
        error: 'Failed to send OTP. Please try again.'
      };
    }
  },
  
  /**
   * Verify OTP and get authentication token
   */
  verifyOTP: async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await apiRequest<AuthResponse>('auth-verify-otp', { 
        phoneNumber, 
        otp 
      });
      
      console.log('AuthService: OTP verification response:', response);
      
      if (response && response.success && response.token) {
        // Store identifiers for facial verification
        localStorage.setItem('userPhone', phoneNumber);
        if (response.user?.id) {
          localStorage.setItem('userId', response.user.id);
        }
        
        // Check if this is an admin user based on response
        const isAdminUser = response.user?.role === 'admin';
        
        if (isAdminUser) {
          setAdminToken(response.token);
          localStorage.setItem('isAdmin', 'true');
        } else {
          setAuthToken(response.token);
          localStorage.setItem('isAdmin', 'false');
        }
        localStorage.setItem('isVerified', 'true');
      }
      
      return response;
    } catch (error: unknown) {
      console.error('AuthService: OTP verification failed:', error);
      
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const err = error as { message?: string; name?: string; context?: unknown };
        if (err.name === 'FunctionsHttpError' && err.context && typeof err.context === 'object') {
          const ctx = err.context as Record<string, unknown>;
          const serverMsg = (ctx.error as string) || (ctx.message as string);
          if (serverMsg) {
            return { success: false, error: serverMsg };
          }
        }
        try {
          const errorData = JSON.parse(err.message || '');
          return {
            success: false,
            error: errorData.error || 'OTP verification failed'
          };
        } catch (parseError) {
          return {
            success: false,
            error: err.message || 'OTP verification failed'
          };
        }
      }
      
      return {
        success: false,
        error: 'OTP verification failed. Please try again.'
      };
    }
  },
  
  /**
   * Perform facial verification
   */
  facialVerification: async (imageData: string, phoneNumber: string): Promise<VoterVerificationResponse> => {
    return await apiRequest<VoterVerificationResponse>('auth-face-verify', {
      imageData,
      phoneNumber
    });
  },
  
  /**
   * Check if user is admin
   */
  isAdmin: (): boolean => {
    return localStorage.getItem('isAdmin') === 'true';
  },
  
  /**
   * Check if user is verified
   */
  isVerified: (): boolean => {
    return localStorage.getItem('isVerified') === 'true';
  },
  
  /**
   * Log out the user
   */
  logout: (): void => {
    localStorage.removeItem('isVerified');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userPhone');
    removeAuthToken();
    removeAdminToken();
  }
};
