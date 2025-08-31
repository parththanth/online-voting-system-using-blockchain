
import { supabase } from "@/integrations/supabase/client";

/**
 * API utilities for the VoteGuard application (Supabase Edge Functions)
 */

// Storage keys
export const TOKEN_STORAGE_KEY = "voteguard_auth_token";
export const ADMIN_TOKEN_STORAGE_KEY = "voteguard_admin_token";

// Get auth token from storage
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// Set auth token in storage
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

// Remove auth token from storage
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// Get admin token from storage
export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

// Set admin token in storage
export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

// Remove admin token from storage
export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

// API request helper using Supabase Edge Functions
export async function apiRequest<T>(
  functionName: string,
  data?: unknown,
  useAdminToken: boolean = false
): Promise<T> {
  try {
    console.log(`Making API request to ${functionName} with data:`, data);
    
    // Auto-detect admin token usage for admin users
    const isAdminUser = localStorage.getItem('isAdmin') === 'true';
    const shouldUseAdminToken = useAdminToken || (isAdminUser && functionName === 'vote');
    
    const token = shouldUseAdminToken ? getAdminToken() : getAuthToken();
    
    // Prepare request options - let Supabase handle Content-Type automatically
    const requestOptions: { body?: unknown; headers?: Record<string, string> } = {};
    
    if (data) {
      requestOptions.body = data; // Pass data object directly
    }
    
    // Only add Authorization header if we have a token
    if (token) {
      requestOptions.headers = {
        'Authorization': `Bearer ${token}`
      };
    }

    console.log(`Request options for ${functionName}:`, requestOptions);

    const { data: result, error } = await supabase.functions.invoke(functionName, requestOptions);

    console.log(`Response from ${functionName}:`, { result, error });

    if (error) {
      console.error(`Edge function error for ${functionName}:`, error);
      // Extract status code from FunctionsHttpError for better error handling
      if (error.name === 'FunctionsHttpError') {
        console.log(`API: FunctionsHttpError detected for ${functionName}`);
        // Check if it's a 409 (already voted) by trying to get response details
        const errorContext = error.context || {};
        console.log(`API: Error context for ${functionName}:`, errorContext);
      }
      throw error;
    }

    return result as T;
  } catch (error: unknown) {
    console.error(`API request failed for ${functionName}:`, error);
    
    // Try to extract more specific error information from Supabase Functions errors
    if (typeof error === 'object' && error !== null && 'name' in error) {
      const err = error as { name?: string; context?: unknown };
      if (err.name === 'FunctionsHttpError' && err.context) {
        console.error(`Edge function ${functionName} context:`, err.context);
      }
    }
    
    throw error;
  }
}
