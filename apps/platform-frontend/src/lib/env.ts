// Environment variables with proper typing
export const env = {
  APP_BASE_URL: import.meta.env.VITE_APP_BASE_URL || 'https://app.example.com',
  DEMO_URL: import.meta.env.VITE_DEMO_URL || 'https://app.example.com/contact-or-demo',
  
  // API URLs - Default to API Gateway in Docker, fallback to direct service URLs for local dev
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  AUTH_API_URL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api/v1',
  SCHOOL_API_URL: import.meta.env.VITE_SCHOOL_API_URL || 'http://localhost:3000/api/v1',
  PAYMENT_API_URL: import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3000/api/v1/payments',
} as const
