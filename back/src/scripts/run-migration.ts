import { BlogPostMigration } from '../migrations/blog-post-migration';
import { connectToDatabase, disconnectFromDatabase } from '../config/database';
import { BlogPostModel } from '../domains/blog/models/BlogPostModel';
import { CustomError } from '../utils/errors';

/**
 * Verify the migration results
 */
async function verifyMigration(): Promise<void> {
  try {
    console.log('Verifying migration results...');

    // Check if all posts have the required fields
    const posts = await BlogPostModel.find().lean();
    const invalidPosts = posts.filter((post) => {
      return (
        !post.status ||
        !post.moderationStatus ||
        !post.version ||
        typeof post.hasActiveUpdate !== 'boolean' ||
        !post.timezone ||
        typeof post.abuseScore !== 'number'
      );
    });

    if (invalidPosts.length > 0) {
      console.error('Found invalid posts after migration:', invalidPosts.length);
      throw new CustomError('Migration verification failed', 500, 'MIGRATION_VERIFICATION_ERROR', {
        invalidPosts,
      });
    }

    // Check if all published posts have publishAt
    const publishedPosts = await BlogPostModel.find({ status: 'PUBLISHED' }).lean();
    const invalidPublishedPosts = publishedPosts.filter((post) => !post.publishAt);

    if (invalidPublishedPosts.length > 0) {
      console.error('Found published posts without publishAt:', invalidPublishedPosts.length);
      throw new CustomError('Migration verification failed', 500, 'MIGRATION_VERIFICATION_ERROR', {
        invalidPublishedPosts,
      });
    }

    console.log('Migration verification successful');
  } catch (error) {
    console.error('Migration verification failed:', error);
    throw error;
  }
}

/**
 * Clean up old backup collections
 */
async function cleanupBackups(): Promise<void> {
  try {
    console.log('Cleaning up old backup collections...');

    const collections = await BlogPostModel.db.listCollections().toArray();
    const backupCollections = collections
      .filter((c) => c.name.startsWith(`${BlogPostModel.collection.name}_backup_`))
      .sort((a, b) => b.name.localeCompare(a.name));

    // Keep the most recent backup
    const backupsToDelete = backupCollections.slice(1);

    for (const backup of backupsToDelete) {
      await BlogPostModel.db.collection(backup.name).drop();
      console.log(`Deleted backup collection: ${backup.name}`);
    }

    console.log('Backup cleanup completed');
  } catch (error) {
    console.error('Backup cleanup failed:', error);
    throw error;
  }
}

/**
 * Main function to run the migration
 */
async function main() {
  try {
    // Connect to database
    await connectToDatabase();

    // Run the migration
    await BlogPostMigration.run();

    // Verify the migration
    await verifyMigration();

    // Clean up old backups
    await cleanupBackups();

    console.log('Migration process completed successfully');
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await disconnectFromDatabase();
  }
}

// Run the script
main();
