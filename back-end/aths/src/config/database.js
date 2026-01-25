import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MongoDB Database Connection Configuration
 * Establishes connection to MongoDB using Mongoose ODM
 */

const connectDatabase = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB Connection Error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
