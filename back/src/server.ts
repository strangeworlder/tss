import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import blogRoutes from './domains/blog/routes/blog.routes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/v1/blog', blogRoutes);

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
console.log('Attempting to connect to MongoDB at:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    const db = mongoose.connection.db;
    if (db) {
      // Log the current database
      console.log('Current database:', db.databaseName);
      // Log all collections
      db.listCollections().toArray((err: Error | null, collections: { name: string }[]) => {
        if (err) {
          console.error('Error listing collections:', err);
          return;
        }
        console.log('Available collections:', collections.map(c => c.name));
      });
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 