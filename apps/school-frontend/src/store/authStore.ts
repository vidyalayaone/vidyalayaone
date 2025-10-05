import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { User, School, APIResponse, AuthResponse } from '../api/types';
import { api } from '../api/api';
import { tokenManager } from '../api/config';
import { getPermissionsFromToken, getUserFromToken } from '../utils/jwt';
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
  isAuthenticated: boolean;
  
  // School data
  school: School | null;
  schoolNotFound: boolean;
  
  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
  
  // Password reset flow state
  resetFlow: PasswordResetFlow;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
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
    isAuthenticated: false,
    school: null,
    schoolNotFound: false,
    isLoading: false,
    isInitializing: true,
    resetFlow: {
      step: 'idle', 
      username: null,
      isInOTPFlow: false,
      isInResetFlow: false,
      resetToken: null,
    },

    // Login action
    login: async (username: string, password: string): Promise<boolean> => {
      set({ isLoading: true });
      
      try {
        const response = await api.login({ username, password });
        
        if (response.success && response.data) {
          const { accessToken, user } = response.data;

          tokenManager.setAccessToken(accessToken);

          // Extract permissions from JWT token and role info
          const permissions = getPermissionsFromToken(accessToken);
          const jwtPayload = getUserFromToken(accessToken);
          
          // Update user with JWT-based role and permissions
          const userWithPermissions = {
            ...user,
            permissions,
            roleName: jwtPayload?.roleName, // Add roleName from JWT for backwards compatibility
            // If user.role is not populated as an object, create it from JWT
            role: user.role || {
              id: jwtPayload?.roleId || '',
              name: jwtPayload?.roleName || '',
              permissions: permissions
            }
          };

          // Update state
          set({
            user: userWithPermissions,
            isAuthenticated: true,
            isLoading: false,
            resetFlow: {
              username: null,
              isInOTPFlow: false,
              isInResetFlow: false,
              resetToken: null,
            }
          });
          
          toast.success(`Welcome back!`);
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
      // Clear tokens immediately
      tokenManager.clearTokens();

      // Reset state
      set({
        user: null,
        isAuthenticated: false,
        resetFlow: {
          username: null,
          isInOTPFlow: false,
          isInResetFlow: false,
          resetToken: null,
        }
      });
      
      toast.success('Logged out successfully');
    },

    // Start password reset flow
    startPasswordReset: async (username: string): Promise<boolean> => {
      set({ isLoading: true });
      
      try {
        const response = await api.forgotPassword({ username });
        
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
        const response = await api.verifyOTP({
          username: resetFlow.username,
          otp
        });

        // console.log(response)
        
        if (response.success && response.data) {

          // console.log(response.data);
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
        const response = await api.resetPassword({
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
        const response = await api.getMe();

        // console.log('Fetched user:', response);
        
        if (response.success && response.data) {
          // Extract permissions from current access token
          const accessToken = tokenManager.getAccessToken();
          const permissions = accessToken ? getPermissionsFromToken(accessToken) : [];
          const jwtPayload = accessToken ? getUserFromToken(accessToken) : null;
          
          // Update user with permissions and role info
          const userWithPermissions = {
            ...response.data.user,
            permissions,
            roleName: jwtPayload?.roleName, // Add roleName from JWT for backwards compatibility
            // Ensure role is properly structured
            role: response.data.user.role || {
              id: jwtPayload?.roleId || '',
              name: jwtPayload?.roleName || '',
              permissions: permissions
            }
          };
          
          set({ user: userWithPermissions });
        }
      } catch (error) {
        console.error('Fetch user error:', error);
      }
    },

    // Fetch school data
    fetchSchool: async (): Promise<void> => {
      try {
        const subdomain = window.location.hostname.split('.')[0] || 'localhost';        
        
        const response = await api.getSchoolBySubdomain(subdomain);
        
        if (response.success && response.data) {
          set({ school: response.data.school, schoolNotFound: false });
        } else {
          // School not found or API returned error
          set({ school: null, schoolNotFound: true });
        }
      } catch (error) {
        console.error('Fetch school error:', error);
        // Network error or other issues - consider as school not found
        set({ school: null, schoolNotFound: true });
      }
    },

    // Initialize auth state from storage
    initialize: async (): Promise<void> => {
      await get().fetchSchool();

      // Check if access token exists
      const accessToken = tokenManager.getAccessToken();

      if (accessToken) {
        // If access token exists, fetch user data
        await get().fetchMe();
        set({ isAuthenticated: true });
      } else {
        // No access token, user is not authenticated
        set({ isAuthenticated: false });
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

useAuthStore.getState().initialize();