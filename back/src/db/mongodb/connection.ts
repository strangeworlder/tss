import mongoose from 'mongoose';
import { MONGODB } from '../../config/config';

// Connection options
const options = {
  autoIndex: true,
  autoCreate: true,
};

// Connect to MongoDB
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB.URI, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Disconnect from MongoDB
export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};

// Connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Close connection on process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default {
  connectMongoDB,
  disconnectMongoDB,
}; 