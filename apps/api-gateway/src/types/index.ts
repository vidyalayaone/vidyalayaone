export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  timestamp: string;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}
