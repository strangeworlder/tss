import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
// Comment out missing imports temporarily
// import { imageTypeDefs } from './domains/images/schemas/image.schema';
// import { blogTypeDefs } from './domains/blog/schemas/blog.schema';
// import { userTypeDefs } from './domains/users/schemas/user.schema';
// import { imageResolvers } from './domains/images/resolvers/image.resolvers';
// import { blogResolvers } from './domains/blog/resolvers/blog.resolvers';
// import { userResolvers } from './domains/users/resolvers/user.resolver';
import { SERVER, MONGODB } from './config/config';
// import blogRoutes from './domains/blog/routes/blog.routes';
import imageRoutes from './domains/images/routes/image.routes';
import authRoutes from './domains/auth/routes/auth.routes';
// import { connectDatabases } from './db/index';
// import { errorMiddleware, formatGraphQLError } from './utils/error.handler';
// import { apiLimiter } from './middlewares/rateLimiter.middleware';
// import { WebSocketService } from './services/websocket.service';
import path from 'path';
// Import blog routes
import blogRoutes from './domains/blog/routes/blog.routes';
import { connectMongoDB } from './db/mongodb/connection';
import { connectRedis, redisClient } from './db/redis/connection';
import userRoutes from './domains/users/routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';
import mongoose from 'mongoose';

// Temporary dummy exports to satisfy compiler
const imageTypeDefs = `
  type Image {
    id: ID!
    url: String!
  }
  type Query {
    images: [Image]
  }
`;
const blogTypeDefs = `
  type Post {
    id: ID!
    title: String!
  }
  extend type Query {
    posts: [Post]
  }
`;
const userTypeDefs = `
  type User {
    id: ID!
    name: String!
  }
  extend type Query {
    users: [User]
  }
`;
const imageResolvers = {
  Query: {
    images: () => []
  }
};
const blogResolvers = {
  Query: {
    posts: () => []
  }
};
const userResolvers = {
  Query: {
    users: () => []
  }
};

// Simple error handler
const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
};

const formatGraphQLError = (err: any) => {
  console.error(err);
  return new Error('Internal GraphQL Error');
};

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: SERVER.CORS_ORIGINS,
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to databases
connectMongoDB();

// Initialize Redis connection
connectRedis().catch(err => {
  console.error('Failed to connect to Redis:', err);
  // Don't exit process, just log the error
});

// Routes
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Add a basic health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Add a health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Static files
app.use('/static', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Serve images from uploads directory with proper CORS headers
app.use('/uploads/images', express.static(path.join(__dirname, '../public/uploads/images'), {
  setHeaders: (res, path) => {
    // Set appropriate CORS headers for static files
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173', 
      'http://localhost:8080'
    ];
    
    // Get the origin from the request
    const origin = res.req.headers.origin;
    
    // If the origin is in our allowed list, set it as the CORS origin
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Otherwise use the first allowed origin
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    
    // Set other necessary headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Set the appropriate content type based on file extension
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// Add an API root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the API',
    endpoints: {
      blog: '/api/v1/blog',
      images: '/api/v1/images',
      auth: '/api/v1/auth',
      graphql: '/graphql'
    }
  });
});

// Combine GraphQL schemas and resolvers
const schema = makeExecutableSchema({
  typeDefs: [imageTypeDefs, blogTypeDefs, userTypeDefs],
  resolvers: [imageResolvers, blogResolvers, userResolvers]
});

// Create Apollo Server
const apolloServer = new ApolloServer({
  schema,
  formatError: formatGraphQLError,
  context: ({ req }) => {
    // Context will be available in resolvers
    return { req };
  },
});

// Simple WebSocket service mock
class WebSocketService {
  constructor(server: any) {
    console.log('WebSocket service initialized');
  }
}

async function startServer() {
  try {
    // Start the Apollo server
    await apolloServer.start();
    
    // Apply Apollo middleware to Express - cast to any to avoid type error
    apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });
    
    // Create HTTP server from Express app
    const httpServer = createServer(app);
    
    // Initialize WebSocket service
    const wsService = new WebSocketService(httpServer);
    
    // Connect to MongoDB
    await connectMongoDB();
    
    // Start the server after successful database connection
    httpServer.listen(SERVER.PORT, '0.0.0.0', () => {
      console.log(`🚀 Server ready at http://0.0.0.0:${SERVER.PORT}${apolloServer.graphqlPath}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    await redisClient.disconnect();
    console.log('Gracefully shutting down');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();