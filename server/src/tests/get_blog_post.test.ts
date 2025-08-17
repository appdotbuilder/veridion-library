import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostInput } from '../schema';
import { getBlogPost } from '../handlers/get_blog_post';

describe('getBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a blog post when it exists', async () => {
    // Create a test blog post
    const testPost = await db.insert(blogPostsTable)
      .values({
        title: 'Test Blog Post',
        content: 'This is a test blog post content.'
      })
      .returning()
      .execute();

    const testInput: GetBlogPostInput = {
      id: testPost[0].id
    };

    const result = await getBlogPost(testInput);

    // Verify the blog post was returned correctly
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testPost[0].id);
    expect(result!.title).toEqual('Test Blog Post');
    expect(result!.content).toEqual('This is a test blog post content.');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when blog post does not exist', async () => {
    const testInput: GetBlogPostInput = {
      id: 999 // Non-existent ID
    };

    const result = await getBlogPost(testInput);

    expect(result).toBeNull();
  });

  it('should handle database querying correctly', async () => {
    // Create multiple blog posts
    const post1 = await db.insert(blogPostsTable)
      .values({
        title: 'First Post',
        content: 'Content of first post.'
      })
      .returning()
      .execute();

    const post2 = await db.insert(blogPostsTable)
      .values({
        title: 'Second Post',
        content: 'Content of second post.'
      })
      .returning()
      .execute();

    // Test fetching the first post
    const result1 = await getBlogPost({ id: post1[0].id });
    expect(result1).not.toBeNull();
    expect(result1!.title).toEqual('First Post');
    expect(result1!.content).toEqual('Content of first post.');

    // Test fetching the second post
    const result2 = await getBlogPost({ id: post2[0].id });
    expect(result2).not.toBeNull();
    expect(result2!.title).toEqual('Second Post');
    expect(result2!.content).toEqual('Content of second post.');

    // Verify they are different posts
    expect(result1!.id).not.toEqual(result2!.id);
  });

  it('should return correct timestamp types', async () => {
    // Create a test blog post
    const testPost = await db.insert(blogPostsTable)
      .values({
        title: 'Timestamp Test Post',
        content: 'Testing timestamp handling.'
      })
      .returning()
      .execute();

    const result = await getBlogPost({ id: testPost[0].id });

    expect(result).not.toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    
    // Verify timestamps are reasonable (within the last few seconds)
    const now = new Date();
    const timeDiff = now.getTime() - result!.created_at.getTime();
    expect(timeDiff).toBeLessThan(5000); // Less than 5 seconds ago
  });
});