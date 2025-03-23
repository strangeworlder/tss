import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Server configuration
export const SERVER = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
};

// MongoDB configuration
export const MONGODB = {
  URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/tss',
};

// PostgreSQL configuration
export const POSTGRES = {
  HOST: process.env.POSTGRES_HOST || 'localhost',
  PORT: Number(process.env.POSTGRES_PORT) || 5432,
  USER: process.env.POSTGRES_USER || 'postgres',
  PASSWORD: process.env.POSTGRES_PASSWORD || 'postgres',
  DB: process.env.POSTGRES_DB || 'tss',
};

// Redis configuration
export const REDIS = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: Number(process.env.REDIS_PORT) || 6379,
};

// JWT configuration
export const JWT = {
  SECRET: process.env.JWT_SECRET || 'secret',
  EXPIRY: process.env.JWT_EXPIRY || '1d',
};

export default {
  SERVER,
  MONGODB,
  POSTGRES,
  REDIS,
  JWT,
}; 