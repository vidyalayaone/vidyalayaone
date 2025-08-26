import app from './app';
import config from './config/config';
import DatabaseService from './services/database';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await DatabaseService.connect();

    // Start the server
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 Attendance Service is running on port ${config.server.port}`);
      console.log(`🌍 Environment: ${config.server.nodeEnv}`);
      console.log(`📊 Database connected: ${config.database.url}`);
      console.log(`🔗 Health check: http://localhost:${config.server.port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await DatabaseService.disconnect();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
