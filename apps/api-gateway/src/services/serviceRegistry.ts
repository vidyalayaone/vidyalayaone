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
        { path: '/login', method: 'POST', isProtected: false },
        { path: '/forgot-password', method: 'POST', isProtected: false },
        { path: '/reset-password', method: 'POST', isProtected: false },
        { path: '/me', method: 'GET', isProtected: true },
        { path: '/refresh-token', method: 'POST', isProtected: true },
        { path: '/logout', method: 'POST', isProtected: true },
        { path: '/update-admin-with-subdomain', method: 'POST', isProtected: true },
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
        { path: '/create', method: 'POST', isProtected: true },
        { path: '/get-by-id/:schoolId', method: 'GET', isProtected: true },
        { path: '/update/:schoolId', method: 'PUT', isProtected: true },
        { path: '/get-by-subdomain/:subdomain', method: 'GET', isProtected: false },
        { path: '/activate/:schoolId', method: 'GET', isProtected: true },
      ],
      healthPath: '/health',
      timeout: config.services.school.timeout,
    });

    // Profile service - fully protected at gateway
    this.services.set('profile', {
      name: 'profile-service',
      url: config.services.profile.url,
      path: '/api/v1/profile',
      isProtected: true, // All routes protected at gateway
      healthPath: '/health',
      timeout: config.services.profile.timeout,
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
