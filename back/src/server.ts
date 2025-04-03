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
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 