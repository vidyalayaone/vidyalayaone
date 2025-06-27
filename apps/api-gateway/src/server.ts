import app from './app';
import config from './config/config';
import HealthCheckService from './services/healthCheck';

const startServer = async (): Promise<void> => {
  try {
    // Check service connectivity before starting
    console.log('🔍 Checking service connectivity...');
    const healthStatuses = await HealthCheckService.checkAllServices();
    
    healthStatuses.forEach(status => {
      const emoji = status.status === 'healthy' ? '✅' : '❌';
      console.log(`${emoji} ${status.service}: ${status.status} ${status.responseTime ? `(${status.responseTime}ms)` : ''}`);
    });
    
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 API Gateway running on port ${config.server.port}`);
      console.log(`📝 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.server.port}/health`);
      console.log(`🔗 Services health: http://localhost:${config.server.port}/health/services`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ API Gateway closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start API Gateway:', error);
    process.exit(1);
  }
};

startServer();
