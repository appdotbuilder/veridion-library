import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type CreateBlogPostInput } from '../schema';
import { updateBlogPost } from '../handlers/update_blog_post';
import { eq } from 'drizzle-orm';

// Helper function to create a test blog post
const createTestBlogPost = async (input: CreateBlogPostInput) => {
  const result = await db.insert(blogPostsTable)
    .values({
      title: input.title,
      content: input.content
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('updateBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update blog post title only', async () => {
    // Create a test blog post first
    const testPost = await createTestBlogPost({
      title: 'Original Title',
      content: 'Original content'
    });

    const originalUpdatedAt = testPost.updated_at;

    // Wait a small amount to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateBlogPostInput = {
      id: testPost.id,
      title: 'Updated Title'
    };

    const result = await updateBlogPost(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testPost.id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.content).toEqual('Original content'); // Should remain unchanged
    expect(result!.created_at).toEqual(testPost.created_at);
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update blog post content only', async () => {
    // Create a test blog post first
    const testPost = await createTestBlogPost({
      title: 'Original Title',
      content: 'Original content'
    });

    const originalUpdatedAt = testPost.updated_at;

    // Wait a small amount to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateBlogPostInput = {
      id: testPost.id,
      content: 'Updated content with more details'
    };

    const result = await updateBlogPost(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testPost.id);
    expect(result!.title).toEqual('Original Title'); // Should remain unchanged
    expect(result!.content).toEqual('Updated content with more details');
    expect(result!.created_at).toEqual(testPost.created_at);
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update both title and content', async () => {
    // Create a test blog post first
    const testPost = await createTestBlogPost({
      title: 'Original Title',
      content: 'Original content'
    });

    const originalUpdatedAt = testPost.updated_at;

    // Wait a small amount to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateBlogPostInput = {
      id: testPost.id,
      title: 'Completely New Title',
      content: 'Completely new content with different information'
    };

    const result = await updateBlogPost(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testPost.id);
    expect(result!.title).toEqual('Completely New Title');
    expect(result!.content).toEqual('Completely new content with different information');
    expect(result!.created_at).toEqual(testPost.created_at);
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when blog post does not exist', async () => {
    const updateInput: UpdateBlogPostInput = {
      id: 999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateBlogPost(updateInput);

    expect(result).toBeNull();
  });

  it('should save updated blog post to database', async () => {
    // Create a test blog post first
    const testPost = await createTestBlogPost({
      title: 'Original Title',
      content: 'Original content'
    });

    const updateInput: UpdateBlogPostInput = {
      id: testPost.id,
      title: 'Database Updated Title',
      content: 'Database updated content'
    };

    await updateBlogPost(updateInput);

    // Query database directly to verify changes were saved
    const updatedPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, testPost.id))
      .execute();

    expect(updatedPosts).toHaveLength(1);
    expect(updatedPosts[0].title).toEqual('Database Updated Title');
    expect(updatedPosts[0].content).toEqual('Database updated content');
    expect(updatedPosts[0].updated_at).not.toEqual(testPost.updated_at);
    expect(updatedPosts[0].created_at).toEqual(testPost.created_at);
  });

  it('should always update the updated_at timestamp even with no other changes', async () => {
    // Create a test blog post first
    const testPost = await createTestBlogPost({
      title: 'Original Title',
      content: 'Original content'
    });

    const originalUpdatedAt = testPost.updated_at;

    // Wait a small amount to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateBlogPostInput = {
      id: testPost.id
      // No title or content provided - only updating timestamp
    };

    const result = await updateBlogPost(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testPost.id);
    expect(result!.title).toEqual('Original Title'); // Should remain unchanged
    expect(result!.content).toEqual('Original content'); // Should remain unchanged
    expect(result!.created_at).toEqual(testPost.created_at);
    expect(result!.updated_at).not.toEqual(originalUpdatedAt);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});