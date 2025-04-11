import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

// Load environment variables from .env.test file if it exists
dotenv.config({ path: '.env.test' });

// Create a MongoDB Memory Server instance
let mongoServer: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Create a new MongoDB Memory Server instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections in the database
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Clean up after all tests
afterAll(async () => {
  // Disconnect from the database
  await mongoose.disconnect();

  // Stop the MongoDB Memory Server
  await mongoServer.stop();
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.CONTENT_ENCRYPTION_KEY = 'test-content-encryption-key';
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to silence specific console methods during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
};
