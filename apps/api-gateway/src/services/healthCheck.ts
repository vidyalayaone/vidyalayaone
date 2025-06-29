import axios from 'axios';
import ServiceRegistry from './serviceRegistry';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

class HealthCheckService {
  async checkService(serviceName: string): Promise<HealthStatus> {
    const service = ServiceRegistry.getService(serviceName);
    
    if (!service) {
      return {
        service: serviceName,
        status: 'unhealthy',
        error: 'Service not found in registry',
      };
    }

    const startTime = Date.now();
    
    try {
      await axios.get(`${service.url}${service.healthPath}`, {
        timeout: service.timeout,
      });
      
      return {
        service: service.name,
        status: 'healthy',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        service: service.name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkAllServices(): Promise<HealthStatus[]> {
    const services = ServiceRegistry.getAllServices();
    const healthChecks = services.map(service => 
      this.checkService(service.name.replace('-service', ''))
    );
    
    return Promise.all(healthChecks);
  }
}

export default new HealthCheckService();

// import axios from 'axios';
// import ServiceRegistry from './serviceRegistry';
//
// interface HealthStatus {
//   service: string;
//   status: 'healthy' | 'unhealthy';
//   responseTime?: number;
//   error?: string;
// }
//
// class HealthCheckService {
//   async checkService(serviceName: string): Promise<HealthStatus> {
//     // console.log(ServiceRegistry.getAllServices());
//     // console.log(ServiceRegistry.getService(serviceName));
//
//
//
//     const service = ServiceRegistry.getService(serviceName);
//
//     if (!service) {
//       return {
//         service: serviceName,
//         status: 'unhealthy',
//         error: 'Service not found in registry',
//       };
//     }
//
//     const startTime = Date.now();
//
//     try {
//       await axios.get(`${service.url}${service.healthPath}`, {
//         timeout: service.timeout,
//       });
//
//       return {
//         service: serviceName,
//         status: 'healthy',
//         responseTime: Date.now() - startTime,
//       };
//     } catch (error) {
//       return {
//         service: serviceName,
//         status: 'unhealthy',
//         responseTime: Date.now() - startTime,
//         error: error instanceof Error ? error.message : 'Unknown error',
//       };
//     }
//   }
//
//   async checkAllServices(): Promise<HealthStatus[]> {
//     const services = ServiceRegistry.getAllServices();
//
//     const healthChecks = services.map(service => this.checkService(service.name));
//
//     return Promise.all(healthChecks);
//   }
// }
//
// export default new HealthCheckService();
