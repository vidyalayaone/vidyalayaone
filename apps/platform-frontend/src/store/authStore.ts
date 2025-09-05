import { create } from 'zustand';
import { User, authAPI } from '@/lib/api';
import { useSchoolStore } from './schoolStore';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateTokensFromStorage: (accessToken: string, refreshToken: string) => void;
}

// Local storage keys
const ACCESS_TOKEN_KEY = 'vidyalaya_access_token';
const REFRESH_TOKEN_KEY = 'vidyalaya_refresh_token';

// Helper functions for localStorage management
const setTokensInStorage = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const removeTokensFromStorage = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const getTokensFromStorage = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  return { accessToken, refreshToken };
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) => set({ user }),
  
  setTokens: (accessToken, refreshToken) => {
    if (accessToken && refreshToken) {
      setTokensInStorage(accessToken, refreshToken);
      set({ accessToken, refreshToken });
    } else {
      removeTokensFromStorage();
      set({ accessToken: null, refreshToken: null });
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),

  login: (user, accessToken, refreshToken) => {
    setTokensInStorage(accessToken, refreshToken);
    set({ 
      user, 
      accessToken, 
      refreshToken, 
      isAuthenticated: true,
      isInitialized: true 
    });
  },

  logout: async () => {
    const { refreshToken } = get();
    
    try {
      // Call API logout if we have a refresh token
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }
    
    // Clear local storage and state
    removeTokensFromStorage();
    set({ 
      user: null, 
      accessToken: null, 
      refreshToken: null, 
      isAuthenticated: false,
      isInitialized: true 
    });
    
    // Clear school store data as well
    useSchoolStore.getState().reset();
  },

  initializeAuth: async () => {
    const { accessToken, refreshToken } = getTokensFromStorage();
    
    if (!accessToken || !refreshToken) {
      set({ isInitialized: true });
      return;
    }

    set({ isLoading: true });

    try {
      // Set tokens in store first
      set({ accessToken, refreshToken });
      
      // Try to get user data with the stored token
      const response = await authAPI.getMe();
      
      if (response.success && response.data) {
        set({ 
          user: response.data, 
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false 
        });
      } else {
        // Token is invalid, clear everything
        removeTokensFromStorage();
        set({ 
          user: null, 
          accessToken: null, 
          refreshToken: null, 
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Token is invalid or expired, clear everything
      removeTokensFromStorage();
      set({ 
        user: null, 
        accessToken: null, 
        refreshToken: null, 
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false 
      });
    }
  },

  updateTokensFromStorage: (accessToken: string, refreshToken: string) => {
    setTokensInStorage(accessToken, refreshToken);
    set({ accessToken, refreshToken });
  },
}));