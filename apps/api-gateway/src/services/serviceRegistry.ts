import config from '../config/config';

export interface RouteConfig {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; // Optional - if not specified, applies to all methods
  isProtected: boolean;
}

export interface ServiceConfig {
  name: string;
  url: string;
  path: string;
  isProtected: boolean; // Default protection level
  routes?: RouteConfig[]; // Route-specific overrides
  healthPath: string;
  timeout: number;
}

class ServiceRegistry {
  private services: Map<string, ServiceConfig> = new Map();

  constructor() {
    this.registerServices();
  }

  private registerServices(): void {
    this.services.set('auth', {
      name: 'auth-service',
      url: config.services.auth.url,
      path: '/api/v1/auth',
      isProtected: false,
      routes: [
        { path: '/register', method: 'POST', isProtected: false },
        { path: '/resend-otp', method: 'POST', isProtected: false },
        { path: '/verify-otp/registration', method: 'POST', isProtected: false },
        { path: '/verify-otp/password-reset', method: 'POST', isProtected: false },
      ],
      healthPath: '/health',
      timeout: config.services.auth.timeout,
    });

    this.services.set('school', {
      name: 'school-service',
      url: config.services.school.url,
      path: '/api/v1/school',
      isProtected: false,
      routes: [
        // Protected routes (platform admin only)
        { path: '/create-school', method: 'POST', isProtected: true },
        { path: '/schools', method: 'GET', isProtected: true },
        { path: '/schools/:schoolId', method: 'GET', isProtected: true },
        { path: '/schools/:schoolId', method: 'PUT', isProtected: true },
        { path: '/schools/:schoolId', method: 'DELETE', isProtected: true },
        
        // Public routes (no auth required)
        { path: '/validate-subdomain', method: 'GET', isProtected: false },
        { path: '/resolve', method: 'GET', isProtected: false },
      ],
      healthPath: '/health',
      timeout: config.services.school.timeout,
    });

    // Future services - fully protected at gateway
    // this.services.set('users', {
    //   name: 'user-service',
    //   url: config.services.users?.url || 'http://localhost:3002',
    //   path: '/api/v1/users',
    //   isProtected: true, // All routes protected at gateway
    //   healthPath: '/health',
    //   timeout: 30000,
    // });

    // this.services.set('exams', {
    //   name: 'exam-service',
    //   url: config.services.exams?.url || 'http://localhost:3003',
    //   path: '/api/v1/exams',
    //   isProtected: true, // All routes protected at gateway
    //   routes: [
    //     // Override default protection for specific routes if needed
    //     { path: '/public-results', method: 'GET', isProtected: false },
    //   ],
    //   healthPath: '/health',
    //   timeout: 30000,
    // });
  }

  getService(name: string): ServiceConfig | undefined {
    return this.services.get(name);
  }

  getAllServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  getServiceByPath(path: string): ServiceConfig | undefined {
    return Array.from(this.services.values()).find(service => 
      path.startsWith(service.path)
    );
  }
}

export default new ServiceRegistry();
export { ServiceRegistry };
