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
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !original?._retry) {
      // console.warn('Token expired, attempting to refresh...');
      original._retry = true;
      
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Use base axios instance to avoid interceptor loops
        const response = await axios.post('/auth/refresh-token', {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        tokenManager.setTokens(accessToken, newRefreshToken);
        
        // Retry original request with new token
        if (original.headers) {
          original.headers.Authorization = `Bearer ${accessToken}`;
        }
        return httpClient(original);
        
      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = '/login';
        // const { logout } = useAuthStore();
        // logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// // Response interceptor for token refresh
// httpClient.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
//     if (error.response?.status === 401 && !original?._retry) {
//       original._retry = true;
      
//       try {
//         const refreshToken = tokenManager.getRefreshToken();
//         if (refreshToken) {
//           const response = await httpClient.post('/auth/refresh', {
//             refreshToken,
//           });
          
//           const { accessToken } = response.data.data;
//           tokenManager.setTokens(accessToken, refreshToken);
          
//           // Retry original request
//           if (original.headers) {
//             original.headers.Authorization = `Bearer ${accessToken}`;
//           }
//           return httpClient(original);
//         }
//       } catch (refreshError) {
//         tokenManager.clearTokens();
//         window.location.href = '/login';
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

export default httpClient;
