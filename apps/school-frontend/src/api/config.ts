// API Configuration
let API_BASE_URL: string;

if (window.location.origin.includes('localhost')) {
  API_BASE_URL = '/api/v1';
} else {
  API_BASE_URL = `${window.location.origin}/api/v1`;
}

// const API_BASE_URL = `${window.location.origin}/api/v1`;
// const API_BASE_URL = 'https://vidyalayaone.com/api/v1';
// const API_BASE_URL = 'http://localhost:3000/api/v1';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Token management
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  setAccessToken: (accessToken: string) => {
    localStorage.setItem('accessToken', accessToken);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken'); // Clear any existing refresh tokens for cleanup
  },
};
