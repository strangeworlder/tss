import mongoose from 'mongoose';
import { CustomError } from '../utils/errors';
import { config } from './config';

/**
 * Connect to MongoDB database
 */
export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    throw new CustomError(
      'Failed to disconnect from MongoDB',
      500,
      'DATABASE_DISCONNECTION_ERROR',
      { error }
    );
  }
}
