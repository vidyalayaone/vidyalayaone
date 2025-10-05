import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiConfig, tokenManager } from './config';
import { useAuthStore } from '@/store/authStore';

// Create axios instance
const httpClient = axios.create(apiConfig);

// Request interceptor to add auth token
httpClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // If token is expired (401), handle differently based on the request
    if (error.response?.status === 401) {
      // Check if this is a login request - if so, don't redirect, let the login form handle it
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isLoginRequest) {
        console.warn('Token expired, logging out user...');
        
        // Clear tokens from storage
        tokenManager.clearTokens();
        
        // Use auth store logout to clean up state
        const { logout } = useAuthStore.getState();
        logout();
        
        // Redirect to login page
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default httpClient;
