import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostInput, type CreateBlogPostInput } from '../schema';
import { deleteBlogPost } from '../handlers/delete_blog_post';
import { eq } from 'drizzle-orm';

// Test input for getting a blog post by ID
const testInput: GetBlogPostInput = {
  id: 1
};

// Test data for creating blog posts
const testBlogPostData: CreateBlogPostInput = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content for deletion testing.'
};

describe('deleteBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing blog post and return true', async () => {
    // Create a blog post first
    const createResult = await db.insert(blogPostsTable)
      .values({
        title: testBlogPostData.title,
        content: testBlogPostData.content
      })
      .returning()
      .execute();

    const createdPost = createResult[0];
    
    // Delete the blog post
    const result = await deleteBlogPost({ id: createdPost.id });

    expect(result).toBe(true);

    // Verify the blog post is actually deleted from the database
    const posts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, createdPost.id))
      .execute();

    expect(posts).toHaveLength(0);
  });

  it('should return false when trying to delete a non-existent blog post', async () => {
    // Try to delete a blog post that doesn't exist
    const result = await deleteBlogPost({ id: 999 });

    expect(result).toBe(false);
  });

  it('should not affect other blog posts when deleting one', async () => {
    // Create multiple blog posts
    const createResult1 = await db.insert(blogPostsTable)
      .values({
        title: 'First Blog Post',
        content: 'Content for first post'
      })
      .returning()
      .execute();

    const createResult2 = await db.insert(blogPostsTable)
      .values({
        title: 'Second Blog Post',
        content: 'Content for second post'
      })
      .returning()
      .execute();

    const post1 = createResult1[0];
    const post2 = createResult2[0];

    // Delete only the first post
    const result = await deleteBlogPost({ id: post1.id });

    expect(result).toBe(true);

    // Verify first post is deleted
    const deletedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, post1.id))
      .execute();

    expect(deletedPost).toHaveLength(0);

    // Verify second post still exists
    const remainingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, post2.id))
      .execute();

    expect(remainingPost).toHaveLength(1);
    expect(remainingPost[0].title).toEqual('Second Blog Post');
  });

  it('should handle deletion with valid ID types', async () => {
    // Create a blog post
    const createResult = await db.insert(blogPostsTable)
      .values({
        title: testBlogPostData.title,
        content: testBlogPostData.content
      })
      .returning()
      .execute();

    const createdPost = createResult[0];

    // Test with number ID (should work)
    const result = await deleteBlogPost({ id: createdPost.id });
    expect(result).toBe(true);

    // Verify deletion
    const posts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, createdPost.id))
      .execute();

    expect(posts).toHaveLength(0);
  });

  it('should verify database state after successful deletion', async () => {
    // Create a blog post
    const createResult = await db.insert(blogPostsTable)
      .values({
        title: testBlogPostData.title,
        content: testBlogPostData.content
      })
      .returning()
      .execute();

    const createdPost = createResult[0];

    // Verify post exists before deletion
    const postsBeforeDeletion = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, createdPost.id))
      .execute();

    expect(postsBeforeDeletion).toHaveLength(1);
    expect(postsBeforeDeletion[0].title).toEqual(testBlogPostData.title);

    // Delete the post
    const result = await deleteBlogPost({ id: createdPost.id });

    expect(result).toBe(true);

    // Verify post is completely removed
    const postsAfterDeletion = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, createdPost.id))
      .execute();

    expect(postsAfterDeletion).toHaveLength(0);

    // Verify total blog posts count decreased
    const allPosts = await db.select()
      .from(blogPostsTable)
      .execute();

    expect(allPosts).toHaveLength(0);
  });
});