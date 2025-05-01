import { BlogPostMigration } from '../migrations/blog-post-migration';
import { connectToDatabase } from '../config/database';
import { CustomError } from '../utils/errors';

/**
 * CLI script to run blog post migration
 */
async function main() {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'run':
        await BlogPostMigration.run();
        break;
      case 'rollback':
        await BlogPostMigration.rollback();
        break;
      default:
        console.error('Invalid command. Use "run" or "rollback"');
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
