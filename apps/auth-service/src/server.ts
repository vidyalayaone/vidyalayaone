import app from './app';
import config from './config/config'
import DatabaseService from './services/database';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await DatabaseService.connect();
    
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 Auth Service running on port ${config.server.port}`);
      console.log(`📝 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.server.port}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await DatabaseService.disconnect();
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


//Hello Abhijeet Singh This is the auth service server file. It initializes the server, connects to the database, and sets up graceful shutdown handling.
// It listens on the port specified in the configuration and logs relevant information to the console.