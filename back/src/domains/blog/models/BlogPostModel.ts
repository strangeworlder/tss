import mongoose, { Document, Schema } from 'mongoose';

// Blog post interface
export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    avatar?: {
      filename: string;
      altText: string;
    };
  };
  heroImage: {
    filename: string;
    altText: string;
  };
  heroImageUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  isPublished: boolean;
}

// Define the BlogPost Schema for MongoDB
const blogPostSchema = new Schema<IBlogPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    avatar: {
      filename: { type: String },
      altText: { type: String }
    }
  },
  heroImage: {
    filename: { type: String, required: true },
    altText: { type: String, required: true }
  },
  heroImageUrl: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date, default: null },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

// Create the model if it doesn't exist already
export const BlogPostModel = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', blogPostSchema);

export default BlogPostModel; 