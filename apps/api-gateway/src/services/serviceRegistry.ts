import config from '../config/config';

interface ServiceConfig {
  name: string;
  url: string;
  healthPath: string;
  timeout: number;
}

class ServiceRegistry {
  private services: Map<string, ServiceConfig> = new Map();

  constructor() {
    this.registerServices();
  }

  private registerServices(): void {
    this.services.set('auth-service', {
      name: 'auth-service',
      url: config.services.auth.url,
      healthPath: '/health',
      timeout: config.services.auth.timeout,
    });
  }

  getService(name: string): ServiceConfig | undefined {
    return this.services.get(name);
  }

  getAllServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }
}

export default new ServiceRegistry();
