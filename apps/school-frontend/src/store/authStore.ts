// Zustand store for authentication and user state

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { User, School, APIResponse, AuthResponse } from '../api/types';
import { mockAPI } from '../api/api';
import toast from 'react-hot-toast';

interface PasswordResetFlow {
  username: string | null;
  isInOTPFlow: boolean;
  isInResetFlow: boolean;
  resetToken: string | null;
}

interface AuthState {
  // User and authentication data
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // School data
  school: School | null;
  
  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
  
  // Password reset flow state
  resetFlow: PasswordResetFlow;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  startPasswordReset: (username: string) => Promise<boolean>;
  verifyResetOTP: (otp: string) => Promise<boolean>;
  resetPassword: (newPassword: string, confirmPassword: string) => Promise<boolean>;
  clearResetFlow: () => void;
  fetchMe: () => Promise<void>;
  fetchSchool: () => Promise<void>;
  initialize: () => Promise<void>;
  
  // Helper methods
  isInPasswordResetFlow: () => boolean;
  canAccessOTPPage: () => boolean;
  canAccessResetPage: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    school: null,
    isLoading: false,
    isInitializing: true,
    resetFlow: {
      username: null,
      isInOTPFlow: false,
      isInResetFlow: false,
      resetToken: null,
    },

    // Login action
    login: async (username: string, password: string): Promise<boolean> => {
      set({ isLoading: true });
      
      try {
        const response = await mockAPI.login({ username, password });
        
        if (response.success && response.data) {
          const { accessToken, refreshToken, user, school } = response.data;
          
          // Store tokens
          sessionStorage.setItem('refreshToken', refreshToken);
          
          // Update state
          set({
            user,
            school,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            resetFlow: {
              username: null,
              isInOTPFlow: false,
              isInResetFlow: false,
              resetToken: null,
            }
          });
          
          toast.success(`Welcome back, ${user.firstName}!`);
          return true;
        } else {
          toast.error(response.message || 'Login failed');
          set({ isLoading: false });
          return false;
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error('An unexpected error occurred');
        set({ isLoading: false });
        return false;
      }
    },

    // Logout action
    logout: () => {
      const { refreshToken } = get();
      
      // Call logout API (fire and forget)
      if (refreshToken) {
        mockAPI.logout(refreshToken).catch(console.error);
      }
      
      // Clear storage
      sessionStorage.removeItem('refreshToken');
      
      // Reset state
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        school: null,
        resetFlow: {
          username: null,
          isInOTPFlow: false,
          isInResetFlow: false,
          resetToken: null,
        }
      });
      
      toast.success('Logged out successfully');
    },

    // Refresh access token
    refreshAccessToken: async (): Promise<boolean> => {
      const { refreshToken } = get();
      
      if (!refreshToken) {
        return false;
      }
      
      try {
        const response = await mockAPI.refreshToken({ refreshToken });
        
        if (response.success && response.data) {
          set({ accessToken: response.data.accessToken });
          return true;
        } else {
          // Refresh token is invalid, logout user
          get().logout();
          return false;
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        get().logout();
        return false;
      }
    },

    // Start password reset flow
    startPasswordReset: async (username: string): Promise<boolean> => {
      set({ isLoading: true });
      
      try {
        const response = await mockAPI.forgotPassword({ username });
        
        if (response.success) {
          set({
            isLoading: false,
            resetFlow: {
              username,
              isInOTPFlow: true,
              isInResetFlow: false,
              resetToken: null,
            }
          });
          
          toast.success(response.message || 'OTP sent successfully');
          return true;
        } else {
          toast.error(response.message || 'Failed to send OTP');
          set({ isLoading: false });
          return false;
        }
      } catch (error) {
        console.error('Password reset error:', error);
        toast.error('An unexpected error occurred');
        set({ isLoading: false });
        return false;
      }
    },

    // Verify OTP
    verifyResetOTP: async (otp: string): Promise<boolean> => {
      const { resetFlow } = get();
      
      if (!resetFlow.username || !resetFlow.isInOTPFlow) {
        toast.error('Invalid OTP verification attempt');
        return false;
      }
      
      set({ isLoading: true });
      
      try {
        const response = await mockAPI.verifyOTP({
          username: resetFlow.username,
          otp
        });
        
        if (response.success && response.data) {
          set({
            isLoading: false,
            resetFlow: {
              ...resetFlow,
              isInOTPFlow: false,
              isInResetFlow: true,
              resetToken: response.data.resetToken,
            }
          });
          
          toast.success('OTP verified successfully');
          return true;
        } else {
          toast.error(response.message || 'Invalid OTP');
          set({ isLoading: false });
          return false;
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        toast.error('An unexpected error occurred');
        set({ isLoading: false });
        return false;
      }
    },

    // Reset password
    resetPassword: async (newPassword: string, confirmPassword: string): Promise<boolean> => {
      const { resetFlow } = get();
      
      if (!resetFlow.resetToken || !resetFlow.isInResetFlow) {
        toast.error('Invalid password reset attempt');
        return false;
      }
      
      set({ isLoading: true });
      
      try {
        const response = await mockAPI.resetPassword({
          resetToken: resetFlow.resetToken,
          newPassword,
          confirmPassword
        });
        
        if (response.success) {
          set({
            isLoading: false,
            resetFlow: {
              username: null,
              isInOTPFlow: false,
              isInResetFlow: false,
              resetToken: null,
            }
          });
          
          toast.success(response.message || 'Password reset successfully');
          return true;
        } else {
          toast.error(response.message || 'Failed to reset password');
          set({ isLoading: false });
          return false;
        }
      } catch (error) {
        console.error('Password reset error:', error);
        toast.error('An unexpected error occurred');
        set({ isLoading: false });
        return false;
      }
    },

    // Clear reset flow
    clearResetFlow: () => {
      set({
        resetFlow: {
          username: null,
          isInOTPFlow: false,
          isInResetFlow: false,
          resetToken: null,
        }
      });
    },

    // Fetch current user
    fetchMe: async (): Promise<void> => {
      try {
        const response = await mockAPI.getMe();
        
        if (response.success && response.data) {
          set({ user: response.data });
        }
      } catch (error) {
        console.error('Fetch user error:', error);
      }
    },

    // Fetch school data
    fetchSchool: async (): Promise<void> => {
      try {
        const subdomain = window.location.hostname.split('.')[0] || 'riversid';
        // console.log(subdomain);
        
        const response = await mockAPI.getSchoolBySubdomain(subdomain);
        // const response = await mockAPI.getSchoolBySubdomain('riverside');
        
        if (response.success && response.data) {
          set({ school: response.data });
        }
      } catch (error) {
        console.error('Fetch school error:', error);
      }
    },

    // Initialize auth state from storage
    initialize: async (): Promise<void> => {

      await get().fetchSchool();

      const refreshToken = sessionStorage.getItem('refreshToken');
      
      if (refreshToken) {
        set({ refreshToken });
        
        // Try to refresh access token
        const success = await get().refreshAccessToken();
        
        if (success) {

          await get().fetchMe();
          
          set({ isAuthenticated: true });
        }
      }
      
      set({ isInitializing: false });
    },

    // Helper methods
    isInPasswordResetFlow: (): boolean => {
      const { resetFlow } = get();
      return resetFlow.isInOTPFlow || resetFlow.isInResetFlow;
    },

    canAccessOTPPage: (): boolean => {
      const { resetFlow } = get();
      return Boolean(resetFlow.username && resetFlow.isInOTPFlow);
    },

    canAccessResetPage: (): boolean => {
      const { resetFlow } = get();
      return Boolean(resetFlow.resetToken && resetFlow.isInResetFlow);
    },
  }))
);

// Auto-initialize auth state when store is created
useAuthStore.getState().initialize();

// Set up automatic token refresh
let refreshTokenInterval: NodeJS.Timeout | null = null;

// Subscribe to authentication state changes
useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // Set up token refresh interval (refresh every 30 minutes)
      refreshTokenInterval = setInterval(() => {
        useAuthStore.getState().refreshAccessToken();
      }, 30 * 60 * 1000);
    } else {
      // Clear refresh interval when logged out
      if (refreshTokenInterval) {
        clearInterval(refreshTokenInterval);
        refreshTokenInterval = null;
      }
    }
  }
);
