// Blog post model interface
export interface BlogPost {
  id: string;
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

// Dummy blog posts data
const blogPosts: BlogPost[] = [
  {
    id: '6',
    title: 'Getting Started with Vue 3',
    slug: 'getting-started-with-vue-3',
    content: `# Getting Started with Vue 3

Vue 3 is the latest major version of the popular JavaScript framework for building user interfaces. It brings several exciting new features and performance improvements.

## Setting Up Your First Vue 3 Project

The easiest way to get started is using the Vue CLI:

\`\`\`bash
npm install -g @vue/cli
vue create my-vue3-project
\`\`\`

When prompted, choose Vue 3 as the preset.

## The Composition API

One of the major new features in Vue 3 is the Composition API, which provides a more flexible way to organize component logic:

\`\`\`vue
<script setup>
import { ref, onMounted } from 'vue'

// Reactive state
const count = ref(0)

// Functions that mutate state and trigger updates
function increment() {
  count.value++
}

// Lifecycle hooks
onMounted(() => {
  console.log('Component is mounted!')
})
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
\`\`\`

## Key Benefits of Vue 3

1. **Smaller Bundle Size**: The core runtime is much smaller than Vue 2
2. **Improved Performance**: Faster rendering and smaller memory footprint
3. **Better TypeScript Support**: Built from the ground up with TypeScript
4. **Composition API**: More flexible code organization
5. **Teleport Component**: Render content anywhere in the DOM

Start building with Vue 3 today to take advantage of these improvements!`,
    excerpt: 'Learn the basics of Vue 3 and the Composition API.',
    author: {
      name: 'Jane Smith',
      avatar: {
        filename: 'placeholder1.webp',
        altText: 'Jane Smith profile picture'
      }
    },
    tags: ['vue', 'javascript', 'frontend', 'composition-api'],
    createdAt: new Date('2025-03-22T09:00:00Z'),
    updatedAt: new Date('2025-03-22T09:00:00Z'),
    publishedAt: new Date('2025-03-22T09:00:00Z'),
    isPublished: true,
    heroImage: {
      filename: 'placeholder2.webp',
      altText: 'Vue 3 logo and code'
    }
  },
  {
    id: '1',
    title: 'Getting Started with TypeScript and Express',
    slug: 'getting-started-with-typescript-and-express',
    content: `# Getting Started with TypeScript and Express

TypeScript has become increasingly popular for building Node.js applications. Its static typing helps catch errors during development and improves code quality.

## Setting Up Your Project

First, initialize your project:

\`\`\`bash
npm init -y
npm install express
npm install -D typescript @types/express @types/node
\`\`\`

## Create a Basic Express Server

\`\`\`typescript
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, TypeScript Express!');
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
\`\`\`

## Benefits of TypeScript with Express

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Improved autocompletion and documentation
3. **Code Quality**: More maintainable and scalable code
4. **Future Compatibility**: Easier to adapt to changes in the API

Start building your robust API today!`,
    excerpt: 'Learn how to set up a Node.js project with TypeScript and Express for better type safety and development experience.',
    author: {
      name: 'Jane Developer',
      avatar: {
        filename: 'placeholder1.webp',
        altText: 'Jane Developer profile picture'
      }
    },
    tags: ['typescript', 'express', 'nodejs', 'backend'],
    createdAt: new Date('2023-10-10T10:00:00Z'),
    updatedAt: new Date('2023-10-10T10:00:00Z'),
    publishedAt: new Date('2023-10-10T10:00:00Z'),
    isPublished: true,
    heroImage: {
      filename: 'placeholder2.webp',
      altText: 'TypeScript and Express code on a computer screen'
    }
  },
  {
    id: '2',
    title: 'Building a REST API with Node.js',
    slug: 'building-a-rest-api-with-nodejs',
    content: `# Building a REST API with Node.js

RESTful APIs are the backbone of modern web applications. In this post, we'll explore how to build a robust REST API using Node.js and Express.

## Project Structure

A well-organized project structure makes your codebase maintainable:

\`\`\`
src/
  controllers/
  models/
  routes/
  middleware/
  utils/
  app.ts
  server.ts
\`\`\`

## Implementing CRUD Operations

Here's a simple example of a user controller:

\`\`\`typescript
// controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
};
\`\`\`

## Best Practices

1. **Validation**: Always validate input data
2. **Error Handling**: Create consistent error responses
3. **Authentication**: Secure your endpoints with JWT
4. **Rate Limiting**: Protect against abuse
5. **Documentation**: Use Swagger/OpenAPI

Following these practices will help you build a production-ready API!`,
    excerpt: 'A comprehensive guide to building robust REST APIs with Node.js, Express, and best practices for production.',
    author: {
      name: 'John Backend',
      avatar: {
        filename: 'placeholder2.webp',
        altText: 'John Backend profile picture'
      }
    },
    tags: ['nodejs', 'express', 'rest', 'api', 'backend'],
    createdAt: new Date('2023-09-15T14:30:00Z'),
    updatedAt: new Date('2023-09-16T08:15:00Z'),
    publishedAt: new Date('2023-09-16T10:00:00Z'),
    isPublished: true,
    heroImage: {
      filename: 'placeholder1.webp',
      altText: 'REST API concept diagram with Node.js logo'
    }
  },
  {
    id: '3',
    title: 'Vue 3 Composition API: A Practical Guide',
    slug: 'vue-3-composition-api-practical-guide',
    content: `# Vue 3 Composition API: A Practical Guide

The Composition API is one of the most significant additions to Vue 3, offering a more flexible way to organize component logic.

## Why Use the Composition API?

The Composition API addresses limitations of the Options API:

- Better TypeScript support
- More reusable logic
- Improved organization for complex components

## Basic Usage

\`\`\`vue
<script setup>
import { ref, computed, onMounted } from 'vue';

// Reactive state
const count = ref(0);

// Computed property
const doubleCount = computed(() => count.value * 2);

// Methods
function increment() {
  count.value++;
}

// Lifecycle hooks
onMounted(() => {
  console.log('Component mounted!');
});
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
\`\`\`

## Creating Composables

Composables are functions that encapsulate and reuse stateful logic:

\`\`\`typescript
// useCounter.ts
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  const doubleCount = computed(() => count.value * 2);
  
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  return {
    count,
    doubleCount,
    increment,
    decrement
  };
}
\`\`\`

## Best Practices

1. Use meaningful names for composables (prefix with "use")
2. Keep composables focused on a single concern
3. Return plain objects instead of reactive objects
4. Document your composables

Start leveraging the power of the Composition API in your Vue 3 projects today!`,
    excerpt: 'Learn how to use Vue 3\'s Composition API to write more maintainable and reusable component logic.',
    author: {
      name: 'Sarah Frontend',
      avatar: {
        filename: 'sarah-frontend.jpg',
        altText: 'Sarah Frontend profile picture'
      }
    },
    tags: ['vue', 'javascript', 'frontend', 'composition-api'],
    createdAt: new Date('2023-11-05T09:45:00Z'),
    updatedAt: new Date('2023-11-06T11:20:00Z'),
    publishedAt: new Date('2023-11-06T14:00:00Z'),
    isPublished: true,
    heroImage: {
      filename: 'vue3-composition-api-hero.jpg',
      altText: 'Vue 3 Composition API code example on screen'
    }
  },
  {
    id: '4',
    title: 'MongoDB and Node.js: Building NoSQL Applications',
    slug: 'mongodb-nodejs-building-nosql-applications',
    content: `# MongoDB vs PostgreSQL: Choosing the Right Database

Selecting the right database for your project is a crucial decision that can impact performance, scalability, and development speed.

## MongoDB: Document Database

MongoDB is a NoSQL database that stores data in flexible, JSON-like documents.

### Strengths:
- Schema flexibility
- Horizontal scaling
- JSON/BSON document model
- Great for rapid prototyping
- Works well with unstructured data

### Example Document:
\`\`\`json
{
  "_id": "60d21b4667d0d8992e610c85",
  "name": "John Doe",
  "email": "john@example.com",
  "profile": {
    "age": 28,
    "interests": ["programming", "music", "hiking"]
  },
  "posts": [
    { "title": "Hello World", "likes": 10 },
    { "title": "My Second Post", "likes": 5 }
  ]
}
\`\`\`

## PostgreSQL: Relational Database

PostgreSQL is a powerful, open-source object-relational database system.

### Strengths:
- ACID compliance
- Complex queries and transactions
- Rich data types and extensions
- Strong consistency
- Advanced indexing

### Example Schema:
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  age INTEGER
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(200),
  likes INTEGER DEFAULT 0
);
\`\`\`

## When to Choose Which?

Choose **MongoDB** when:
- Your data structure might change frequently
- You need horizontal scaling
- You're working with document-oriented data
- You need rapid development and flexibility

Choose **PostgreSQL** when:
- Data relationships are complex
- You need transactions and data integrity
- You require complex queries and aggregations
- Your schema is well-defined and relatively stable

## Hybrid Approach

Many modern applications use both types of databases:
- PostgreSQL for transactional data
- MongoDB for content and user-generated data

Choose the right tool for the specific requirements of your project!`,
    excerpt: 'An in-depth comparison of MongoDB and PostgreSQL to help you choose the right database for your next project.',
    author: {
      name: 'Alex DBAdmin',
      avatar: {
        filename: 'alex-dbadmin.jpg',
        altText: 'Alex DBAdmin profile picture'
      }
    },
    tags: ['database', 'mongodb', 'postgresql', 'nosql', 'sql'],
    createdAt: new Date('2023-08-20T16:15:00Z'),
    updatedAt: new Date('2023-08-21T09:30:00Z'),
    publishedAt: new Date('2023-08-21T13:00:00Z'),
    isPublished: true,
    heroImage: {
      filename: 'mongodb-nodejs-hero.jpg',
      altText: 'MongoDB and Node.js integration diagram'
    }
  },
  {
    id: '5',
    title: 'CSS Grid Layout: Modern Web Design Techniques',
    slug: 'css-grid-layout-modern-web-design-techniques',
    content: `# CSS Grid Layout: Modern Web Design Techniques

Modern CSS gives us powerful tools to create responsive layouts. CSS Grid and Flexbox are two layout systems that complement each other perfectly.

## CSS Grid: Two-Dimensional Layout

CSS Grid excels at creating two-dimensional layouts where you need control over both rows and columns.

### Basic Grid Layout

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 1rem;
}
\`\`\`

This creates a responsive grid where each item is at least 250px wide, and columns automatically adjust to fill the available space.

### Common Grid Patterns

#### Holy Grail Layout

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav content sidebar"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .layout {
    grid-template-areas:
      "header"
      "nav"
      "content"
      "sidebar"
      "footer";
    grid-template-columns: 1fr;
  }
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.content { grid-area: content; }
.sidebar { grid-area: sidebar; }
.footer { grid-area: footer; }
\`\`\`

## Flexbox: One-Dimensional Layout

Flexbox is perfect for one-dimensional layouts, whether horizontal or vertical.

### Navigation Bar

\`\`\`css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

@media (max-width: 600px) {
  .navbar {
    flex-direction: column;
  }
  
  .nav-links {
    flex-direction: column;
    width: 100%;
  }
}
\`\`\`

### Card Layout

\`\`\`css
.card {
  display: flex;
  flex-direction: column;
}

.card-content {
  flex: 1; /* Takes up available space */
}

.card-footer {
  margin-top: auto; /* Pushes footer to bottom */
}
\`\`\`

## Combining Grid and Flexbox

For optimal layouts, use both:

\`\`\`css
/* Page layout with CSS Grid */
.page {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-gap: 1rem;
}

/* Card container with CSS Grid */
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 1rem;
}

/* Individual cards with Flexbox */
.card {
  display: flex;
  flex-direction: column;
}

.card-content {
  flex: 1;
}

.card-actions {
  display: flex;
  justify-content: space-between;
}
\`\`\`

## Best Practices

1. **Use Grid for page layouts** and two-dimensional structures
2. **Use Flexbox for components** and one-dimensional alignments
3. **Avoid fixed dimensions** when possible
4. **Test across devices** and screen sizes
5. **Use modern CSS features** like clamp(), min(), and max()

By mastering these tools, you can create maintainable, responsive layouts that work across all devices!`,
    excerpt: 'Master modern responsive web design using the power of CSS Grid and Flexbox for flexible, maintainable layouts.',
    author: {
      name: 'Olivia Designer',
      avatar: {
        filename: 'olivia-designer.jpg',
        altText: 'Olivia Designer profile picture'
      }
    },
    tags: ['css', 'responsive-design', 'frontend', 'flexbox', 'css-grid'],
    createdAt: new Date('2023-09-30T13:15:00Z'),
    updatedAt: new Date('2023-10-01T16:30:00Z'),
    publishedAt: new Date('2023-10-01T17:00:00Z'),
    isPublished: true,
    heroImage: {
      filename: 'css-grid-hero.jpg',
      altText: 'CSS Grid layout example with colorful grid cells'
    }
  }
];

// Get all posts (optionally limited)
export const getPosts = (limit: number = 10): BlogPost[] => {
  // Sort posts by publishedAt date (newest first) and filter only published posts
  return blogPosts
    .filter(post => post.isPublished)
    .sort((a, b) => {
      // Handle null publishedAt dates
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    })
    .slice(0, limit);
};

/**
 * Get post by slug
 * @param slug The post slug to find
 */
export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

// Get total post count
export const getPostCount = (): number => {
  return blogPosts.filter(post => post.isPublished).length;
}; 