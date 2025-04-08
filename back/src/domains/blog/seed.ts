import { connectMongoDB, disconnectMongoDB } from '../../db/mongodb/connection';
import { faker } from '@faker-js/faker';
import BlogPostModel, { IBlogPost } from './models/BlogPostModel';

// Define a type for just the blog post data without Mongoose Document properties
type BlogPostData = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    avatar: {
      filename: string;
      altText: string;
    };
  };
  heroImage: {
    filename: string;
    altText: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  isPublished: boolean;
};

// Helper function to create a markdown content
const generateMarkdownContent = (title: string): string => {
  const paragraphs = faker.datatype.number({ min: 3, max: 6 });
  let content = `# ${title}\n\n`;

  content += `${faker.lorem.paragraphs(1)}\n\n`;

  // Add a subheading
  content += `## ${faker.lorem.words(3)}\n\n`;
  content += `${faker.lorem.paragraphs(2)}\n\n`;

  // Add a code block
  content += '```typescript\n';
  content += `const ${faker.lorem.word()} = () => {\n`;
  content += `  console.log('${faker.lorem.sentence()}');\n`;
  content += `  return ${faker.datatype.number({ min: 1, max: 100 })};\n`;
  content += '};\n';
  content += '```\n\n';

  // Add a list
  content += `## ${faker.lorem.words(2)}\n\n`;
  const listItems = faker.datatype.number({ min: 3, max: 5 });
  for (let i = 0; i < listItems; i++) {
    content += `${i + 1}. **${faker.lorem.words(2)}**: ${faker.lorem.sentence()}\n`;
  }

  content += `\n${faker.lorem.paragraphs(1)}`;

  return content;
};

// Create dummy blog posts
const createDummyBlogPosts = async (): Promise<void> => {
  const techTags = [
    'javascript',
    'typescript',
    'vue',
    'react',
    'node',
    'express',
    'mongodb',
    'postgresql',
    'graphql',
    'docker',
    'aws',
    'frontend',
    'backend',
    'fullstack',
    'api',
  ];
  const avatars = ['avatar1.webp', 'avatar2.webp', 'avatar3.webp', 'avatar4.webp'];
  const heroImages = ['hero1.webp', 'hero2.webp', 'hero3.webp', 'hero4.webp', 'hero5.webp'];

  const dummyPosts: BlogPostData[] = [];

  // Generate 10 dummy blog posts
  for (let i = 0; i < 10; i++) {
    // Create a title
    const title = faker.lorem
      .words(faker.datatype.number({ min: 3, max: 6 }))
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Create a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');

    // Create content
    const content = generateMarkdownContent(title);

    // Create random tags (between 2 and 5)
    const tagCount = faker.datatype.number({ min: 2, max: 5 });
    const tags: string[] = [];
    for (let j = 0; j < tagCount; j++) {
      const randomTag = techTags[faker.datatype.number({ min: 0, max: techTags.length - 1 })];
      if (!tags.includes(randomTag)) {
        tags.push(randomTag);
      }
    }

    // Create dates
    const createdAt = faker.date.past();
    const updatedAt = faker.date.between(createdAt, new Date());
    const isPublished = faker.datatype.boolean();
    const publishedAt = isPublished ? faker.date.between(createdAt, updatedAt) : null;

    // Create the post
    const post: BlogPostData = {
      title,
      slug,
      content,
      excerpt: faker.lorem.sentences(2),
      author: {
        name: faker.name.fullName(),
        avatar: {
          filename: avatars[faker.datatype.number({ min: 0, max: avatars.length - 1 })],
          altText: `Profile picture of ${faker.name.fullName()}`,
        },
      },
      heroImage: {
        filename: heroImages[faker.datatype.number({ min: 0, max: heroImages.length - 1 })],
        altText: `${title} cover image`,
      },
      tags,
      createdAt,
      updatedAt,
      publishedAt,
      isPublished,
    };

    dummyPosts.push(post);
  }

  // Save the posts to the database
  try {
    // Clear existing posts
    await BlogPostModel.deleteMany({});
    console.log('Cleared existing blog posts');

    // Insert new posts
    await BlogPostModel.insertMany(dummyPosts);
    console.log(`Successfully inserted ${dummyPosts.length} blog posts`);
  } catch (error) {
    console.error('Error seeding blog posts:', error);
  }
};

// Run the seed function
const seedBlogPosts = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Create dummy blog posts
    await createDummyBlogPosts();

    // Disconnect from MongoDB
    await disconnectMongoDB();

    console.log('Blog post seeding completed successfully');
  } catch (error) {
    console.error('Error during blog post seeding:', error);
  }
};

// Execute the seed function if this file is run directly
if (require.main === module) {
  seedBlogPosts();
}

export default seedBlogPosts;
