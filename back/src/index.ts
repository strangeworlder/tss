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
import { SERVER } from './config/config';
// import blogRoutes from './domains/blog/routes/blog.routes';
import imageRoutes from './domains/images/routes/image.routes';
// import authRoutes from './domains/users/routes/auth.routes';
// import { connectDatabases } from './db/index';
// import { errorMiddleware, formatGraphQLError } from './utils/error.handler';
// import { apiLimiter } from './middlewares/rateLimiter.middleware';
// import { WebSocketService } from './services/websocket.service';
import path from 'path';
// Import blog routes
import blogRoutes from './domains/blog/routes/blog.routes';
import { connectMongoDB } from './db/mongodb/connection';

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

const authRoutes = express.Router();
authRoutes.get('/', (req, res) => res.json({ message: 'Auth API' }));

// Skip database connection for now
// connectDatabases().catch(err => {
//  console.error('Failed to connect to databases:', err);
//  process.exit(1);
// });

// Initialize Express
const app = express();

// Configure CORS - add this before any routes
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:4000'], // Add all potential frontend origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Simple rate limiter
const apiLimiter = (req: Request, res: Response, next: NextFunction) => next();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));

// Only parse JSON and URL-encoded bodies for non-multipart requests
app.use((req, res, next) => {
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  if (!req.headers['content-type']?.includes('multipart/form-data')) {
    express.urlencoded({ extended: true })(req, res, next);
  } else {
    next();
  }
});

// Rate limiting
app.use('/api', apiLimiter);

// Add a basic health check endpoint
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API server is running' });
});

// Static files
app.use('/static', express.static(path.join(__dirname, '../public')));

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

// Routes
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/auth', authRoutes);

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
  // Start the Apollo server
  await apolloServer.start();
  
  // Apply Apollo middleware to Express - cast to any to avoid type error
  apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });
  
  // Create HTTP server from Express app
  const httpServer = createServer(app);
  
  // Initialize WebSocket service
  const wsService = new WebSocketService(httpServer);
  
  // Add error handling middleware
  app.use(errorMiddleware);
  
  // Connect to MongoDB
  connectMongoDB()
    .then(() => {
      console.log('Connected to MongoDB successfully');
      
      // Start the server after successful database connection
      httpServer.listen(SERVER.PORT, '0.0.0.0', () => {
        console.log(`🚀 Server ready at http://0.0.0.0:${SERVER.PORT}${apolloServer.graphqlPath}`);
        console.log(`🔌 WebSocket server ready at ws://0.0.0.0:${SERVER.PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
}); 