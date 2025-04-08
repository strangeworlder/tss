import { connectMongoDB } from './mongodb/connection';
import { connectPostgres } from './postgres/connection';
import { connectRedis } from './redis/connection';

// Connect to all databases
export const connectDatabases = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Connect to PostgreSQL
    await connectPostgres();

    // Connect to Redis
    await connectRedis();

    console.log('All database connections established successfully');
  } catch (error) {
    console.error('Error connecting to databases:', error);
    process.exit(1);
  }
};

export default {
  connectDatabases,
};
