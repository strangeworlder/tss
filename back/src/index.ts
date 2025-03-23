import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { imageTypeDefs } from './domains/images/schemas/image.schema';
import { imageResolvers } from './domains/images/resolvers/image.resolvers';
import { SERVER } from './config/config';
import blogRoutes from './domains/blog/routes/blog.routes';
import imageRoutes from './domains/images/routes/image.routes';
import path from 'path';

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get(`${SERVER.API_PREFIX}/healthcheck`, (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// Blog routes
app.use(`${SERVER.API_PREFIX}/blog`, blogRoutes);

// Image routes
app.use(`${SERVER.API_PREFIX}/images`, imageRoutes);

// User routes
app.post(`${SERVER.API_PREFIX}/auth/register`, (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Basic validation
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Simulate user registration (in a real app, we would save to the database)
  return res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: '12345',
      email,
      firstName,
      lastName,
      role: 'user',
    },
  });
});

app.post(`${SERVER.API_PREFIX}/auth/login`, (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Simulate login (in a real app, we would check user credentials against the database)
  return res.status(200).json({
    message: 'Login successful',
    token: 'sample-jwt-token',
    user: {
      id: '12345',
      email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Setup Apollo Server for GraphQL
const startServer = async () => {
  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs: [imageTypeDefs],
    resolvers: [imageResolvers]
  });

  // Start the Apollo Server
  await apolloServer.start();
  
  // Apply middleware to Express - FIX: Type cast app to any to resolve type mismatch
  apolloServer.applyMiddleware({ 
    app: app as any, 
    path: `${SERVER.API_PREFIX}/graphql` 
  });
  
  // Start the Express server
  app.listen(SERVER.PORT, () => {
    console.log(`Server running on port ${SERVER.PORT} in ${SERVER.NODE_ENV} mode`);
    console.log(`REST API available at http://localhost:${SERVER.PORT}${SERVER.API_PREFIX}`);
    console.log(`GraphQL API available at http://localhost:${SERVER.PORT}${SERVER.API_PREFIX}/graphql`);
  });
};

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
}); 