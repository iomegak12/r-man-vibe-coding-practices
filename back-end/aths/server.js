import dotenv from 'dotenv';
import app from './src/app.js';
import connectDatabase from './src/config/database.js';
import { verifyEmailConfig } from './src/config/email.js';

// Load environment variables
dotenv.config();

/**
 * Server Entry Point
 * Initializes database connection and starts the Express server
 */

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start Server
const startServer = async () => {
  try {
    // Connect to Database
    await connectDatabase();

    // Verify Email Configuration
    await verifyEmailConfig();

    // Start Express Server
    app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log('🔐 Authentication Service (ATHS)');
      console.log('========================================');
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🚪 Port: ${PORT}`);
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
      console.log(`📚 API: http://localhost:${PORT}/api`);
      console.log('========================================\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();
