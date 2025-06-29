import config from '../config/config';

export interface ServiceConfig {
  name: string;
  url: string;
  path: string;
  isProtected: boolean;
  healthPath: string;
  timeout: number;
}

class ServiceRegistry {
  private services: Map<string, ServiceConfig> = new Map();

  constructor() {
    this.registerServices();
  }

  private registerServices(): void {
    // Auth service - mixed routes (handles own auth)
    this.services.set('auth', {
      name: 'auth-service',
      url: config.services.auth.url,
      path: '/api/v1/auth',
      isProtected: false, // Service handles its own auth
      healthPath: '/health',
      timeout: config.services.auth.timeout,
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
