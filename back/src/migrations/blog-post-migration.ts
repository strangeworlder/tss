import { BlogPostModel } from '../domains/blog/models/BlogPostModel';
import { BlogPostStatus, BlogPostModerationStatus } from '@shared/types/blog/blog';
import { CustomError } from '../utils/errors';
import mongoose from 'mongoose';
import { Collection } from 'mongodb';

/**
 * Migration script for updating blog posts to match the new schema
 */
export namespace BlogPostMigration {
  const BATCH_SIZE = 100;
  const BACKUP_PREFIX = 'blog_posts_backup_';
  let backupCollectionName: string;

  /**
   * Run the migration
   */
  export async function run(): Promise<void> {
    try {
      console.log('Starting blog post migration...');

      // Create backup of existing posts
      await createBackup();

      // Validate schema structure
      await validateSchema();

      // Update posts in batches
      await updatePosts();

      // Verify migration
      await verifyMigration();

      console.log('Blog post migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      await handleMigrationFailure(error);
      throw new CustomError('Blog post migration failed', 500, 'MIGRATION_ERROR', { error });
    }
  }

  /**
   * Create a backup of existing posts
   */
  async function createBackup(): Promise<void> {
    console.log('Creating backup of existing posts...');

    // Create a backup collection with timestamp
    backupCollectionName = BACKUP_PREFIX + new Date().toISOString().replace(/[:.]/g, '_');

    // Count documents before backup
    const count = await BlogPostModel.countDocuments();
    console.log(`Found ${count} documents to back up`);

    // Copy all documents to backup collection
    await BlogPostModel.collection
      .aggregate([{ $match: {} }, { $out: backupCollectionName }])
      .next();

    // Verify backup
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not initialized');
    }

    const backupCount = await db.collection(backupCollectionName).countDocuments();
    if (backupCount !== count) {
      throw new Error(
        `Backup verification failed: expected ${count} documents, found ${backupCount}`
      );
    }

    console.log(`Backup created successfully in collection: ${backupCollectionName}`);
  }

  /**
   * Validate that the schema structure is compatible with the migration
   */
  async function validateSchema(): Promise<void> {
    console.log('Validating schema structure...');

    // Get a sample post to check structure
    const sample = await BlogPostModel.findOne().lean();
    if (!sample) {
      console.log('No blog posts found to validate schema');
      return;
    }

    // Check required fields for migration
    const requiredFields = ['_id', 'title', 'content'];
    const missingFields = requiredFields.filter((field) => !(field in sample));

    if (missingFields.length > 0) {
      throw new Error(
        `Schema validation failed: missing required fields ${missingFields.join(', ')}`
      );
    }

    console.log('Schema validation completed successfully');
  }

  /**
   * Update posts in batches
   */
  async function updatePosts(): Promise<void> {
    console.log('Updating posts...');

    let processed = 0;
    let updated = 0;
    let hasMore = true;
    let errors = 0;

    while (hasMore) {
      const posts = await BlogPostModel.find().skip(processed).limit(BATCH_SIZE).lean();

      if (posts.length === 0) {
        hasMore = false;
        continue;
      }

      console.log(`Processing batch of ${posts.length} posts...`);

      for (const post of posts) {
        try {
          const wasUpdated = await updatePost(post);
          if (wasUpdated) {
            updated++;
          }
        } catch (error) {
          errors++;
          console.error(`Error updating post ${post._id}:`, error);
        }
      }

      processed += posts.length;
      console.log(`Progress: ${processed} posts processed, ${updated} updated, ${errors} errors`);
    }

    console.log(
      `Migration summary: ${processed} posts processed, ${updated} updated, ${errors} errors`
    );

    if (errors > 0) {
      throw new Error(`Migration completed with ${errors} errors`);
    }
  }

  /**
   * Update a single post to match the new schema
   * @returns True if post was updated, false if no updates were needed
   */
  async function updatePost(post: any): Promise<boolean> {
    const updates: Record<string, any> = {};

    // Handle basic fields
    if (!post.slug && post.title) {
      updates.slug = generateSlug(post.title);
    }

    if (!post.excerpt && post.content) {
      updates.excerpt = post.content.substring(0, 200);
    }

    // Update author field structure
    if (!post.author || typeof post.author !== 'object') {
      updates.author = {
        type: 'text',
        name: 'Anonymous',
      };
    } else if (!post.author.type) {
      updates.author = {
        ...post.author,
        type: 'text',
      };
    }

    // Ensure author name exists
    if (post.author && !post.author.name) {
      updates.author = {
        ...post.author,
        name: 'Anonymous',
      };
    }

    // Update tags array
    if (!Array.isArray(post.tags)) {
      updates.tags = [];
    }

    // Update status field
    if (post.isPublished === true && !post.status) {
      updates.status = BlogPostStatus.PUBLISHED;
    } else if (!post.status) {
      updates.status = BlogPostStatus.DRAFT;
    }

    // Update moderation status
    if (!post.moderationStatus) {
      updates.moderationStatus = BlogPostModerationStatus.PENDING;
    }

    // Update version control fields
    if (typeof post.version !== 'number') {
      updates.version = 1;
    }

    if (typeof post.hasActiveUpdate !== 'boolean') {
      updates.hasActiveUpdate = false;
    }

    // Update timezone
    if (!post.timezone) {
      updates.timezone = 'UTC';
    }

    // Update abuse score
    if (typeof post.abuseScore !== 'number') {
      updates.abuseScore = 0;
    }

    // Handle date fields
    if (!post.createdAt) {
      updates.createdAt = new Date();
    }

    if (!post.updatedAt) {
      updates.updatedAt = new Date();
    }

    // Handle publishAt
    if (post.publishedAt && !post.publishAt) {
      updates.publishAt = post.publishedAt;
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      await BlogPostModel.updateOne({ _id: post._id }, { $set: updates });
      return true;
    }

    return false;
  }

  /**
   * Generate a slug from a title
   */
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  /**
   * Verify the migration was successful
   */
  async function verifyMigration(): Promise<void> {
    console.log('Verifying migration...');

    // Sample verification: check for posts missing required fields
    const invalidPosts = await BlogPostModel.find({
      $or: [
        { status: { $exists: false } },
        { moderationStatus: { $exists: false } },
        { author: { $exists: false } },
        { version: { $exists: false } },
        { hasActiveUpdate: { $exists: false } },
      ],
    }).limit(10);

    if (invalidPosts.length > 0) {
      console.error(
        `Verification failed: Found ${invalidPosts.length} posts with missing required fields`
      );
      console.error('Example invalid post:', invalidPosts[0]);
      throw new Error(
        'Migration verification failed: some posts are still missing required fields'
      );
    }

    console.log('Verification completed successfully');
  }

  /**
   * Handle migration failure
   */
  async function handleMigrationFailure(error: any): Promise<void> {
    console.error('Handling migration failure...');

    // Log error details
    console.error('Error details:', error);

    // No automatic rollback - safer to require manual intervention for production
    console.error(
      `Migration failed. To rollback manually, run the rollback method with backup: ${backupCollectionName}`
    );
  }

  /**
   * Rollback the migration
   */
  export async function rollback(backupName?: string): Promise<void> {
    try {
      console.log('Starting rollback...');

      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not initialized');
      }

      let collectionToUse = backupName;

      // If no backup name specified, find the most recent backup
      if (!collectionToUse) {
        const collections = await db.listCollections().toArray();
        const backupCollections = collections
          .filter((c: { name: string }) => c.name.startsWith(BACKUP_PREFIX))
          .sort((a: { name: string }, b: { name: string }) => b.name.localeCompare(a.name));

        if (backupCollections.length === 0) {
          throw new Error('No backup found for rollback');
        }

        collectionToUse = backupCollections[0].name;
      }

      console.log(`Rolling back using backup: ${collectionToUse}`);

      // Verify backup collection exists
      const backupExists = await db.listCollections({ name: collectionToUse }).hasNext();
      if (!backupExists) {
        throw new Error(`Backup collection ${collectionToUse} does not exist`);
      }

      // Count documents in backup
      const backupCount = await db.collection(collectionToUse).countDocuments();
      console.log(`Backup contains ${backupCount} documents`);

      // Create a temporary backup of current state before rollback
      const tempBackup = `${BACKUP_PREFIX}pre_rollback_${new Date().toISOString().replace(/[:.]/g, '_')}`;
      await BlogPostModel.collection.aggregate([{ $match: {} }, { $out: tempBackup }]).next();

      console.log(`Created temporary backup of current state: ${tempBackup}`);

      // Drop current collection
      await BlogPostModel.collection.drop();

      // Restore from backup
      await db
        .collection(collectionToUse)
        .aggregate([{ $match: {} }, { $out: BlogPostModel.collection.name }])
        .next();

      // Verify rollback
      const restoredCount = await BlogPostModel.countDocuments();
      if (restoredCount !== backupCount) {
        throw new Error(
          `Rollback verification failed: expected ${backupCount} documents, found ${restoredCount}`
        );
      }

      console.log(`Rollback completed successfully. Restored ${restoredCount} documents.`);
    } catch (error) {
      console.error('Rollback failed:', error);
      throw new CustomError('Blog post migration rollback failed', 500, 'ROLLBACK_ERROR', {
        error,
      });
    }
  }
}
