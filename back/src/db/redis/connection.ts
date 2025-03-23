import { createClient, RedisClientType } from 'redis';
import { REDIS } from '../../config/config';

// Create Redis client
export const redisClient: RedisClientType = createClient({
  socket: {
    host: REDIS.HOST,
    port: REDIS.PORT,
  },
});

// Connect to Redis
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
    process.exit(1);
  }
};

// Disconnect from Redis
export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.disconnect();
    console.log('Redis disconnected successfully');
  } catch (error) {
    console.error('Redis disconnection error:', error);
  }
};

// Redis error event
redisClient.on('error', (err) => {
  console.error(`Redis client error: ${err}`);
});

// Close Redis connection on process termination
process.on('SIGINT', async () => {
  await redisClient.disconnect();
  process.exit(0);
});

export default {
  connectRedis,
  disconnectRedis,
  redisClient,
}; 