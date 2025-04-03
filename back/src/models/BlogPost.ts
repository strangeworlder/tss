import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthor {
  name: string;
  avatar?: string;
}

export interface IHeroImage {
  url: string;
  alt: string;
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: IAuthor;
  heroImage?: IHeroImage;
  tags: string[];
  publishDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required']
  },
  author: {
    name: {
      type: String,
      required: true
    },
    avatar: String
  },
  heroImage: {
    url: String,
    alt: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  publishDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
BlogPostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model<IBlogPost>('BlogPost', BlogPostSchema); 