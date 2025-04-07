import { createClient, type RedisClientType } from 'redis';
import { REDIS } from '../../config/config';

// Create Redis client
export const redisClient: RedisClientType = createClient({
  socket: {
    host: REDIS.HOST,
    port: REDIS.PORT,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        return new Error('Max reconnection attempts reached');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

// Connect to Redis
export const connectRedis = async (): Promise<void> => {
  try {
    // Check if already connected
    if (redisClient.isOpen) {
      console.log('Redis already connected');
      return;
    }

    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
    // Don't exit process, just log the error
    throw error;
  }
};

// Disconnect from Redis
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      console.log('Redis disconnected successfully');
    }
  } catch (error) {
    console.error('Redis disconnection error:', error);
  }
};

// Redis error event
redisClient.on('error', (err) => {
  console.error(`Redis client error: ${err}`);
});

// Redis ready event
redisClient.on('ready', () => {
  console.log('Redis client is ready');
});

// Close Redis connection on process termination
process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});

export default {
  connectRedis,
  disconnectRedis,
  redisClient,
};
