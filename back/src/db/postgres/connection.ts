import { Pool, type PoolClient } from 'pg';
import { POSTGRES } from '../../config/config';

// Create a new Pool
const pool = new Pool({
  host: POSTGRES.HOST,
  port: POSTGRES.PORT,
  user: POSTGRES.USER,
  password: POSTGRES.PASSWORD,
  database: POSTGRES.DB,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Connect to PostgreSQL
export const connectPostgres = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};

// Execute a query
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Get a client from the pool
export const getClient = async (): Promise<PoolClient> => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error getting client from pool:', error);
    throw error;
  }
};

// Close the pool
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('PostgreSQL pool closed successfully');
  } catch (error) {
    console.error('Error closing PostgreSQL pool:', error);
  }
};

// Close pool on process termination
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

export default {
  connectPostgres,
  query,
  getClient,
  closePool,
};
