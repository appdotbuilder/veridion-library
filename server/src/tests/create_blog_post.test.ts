import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { createBlogPost } from '../handlers/create_blog_post';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content for testing purposes.'
};

describe('createBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a blog post', async () => {
    const result = await createBlogPost(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Blog Post');
    expect(result.content).toEqual(testInput.content);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save blog post to database', async () => {
    const result = await createBlogPost(testInput);

    // Query using proper drizzle syntax
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts).toHaveLength(1);
    expect(blogPosts[0].title).toEqual('Test Blog Post');
    expect(blogPosts[0].content).toEqual(testInput.content);
    expect(blogPosts[0].id).toEqual(result.id);
    expect(blogPosts[0].created_at).toBeInstanceOf(Date);
    expect(blogPosts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create blog post with long content', async () => {
    const longContentInput: CreateBlogPostInput = {
      title: 'Long Content Blog Post',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50)
    };

    const result = await createBlogPost(longContentInput);

    expect(result.title).toEqual('Long Content Blog Post');
    expect(result.content).toEqual(longContentInput.content);
    expect(result.content.length).toBeGreaterThan(100);
    expect(result.id).toBeDefined();
  });

  it('should create blog post with special characters', async () => {
    const specialCharsInput: CreateBlogPostInput = {
      title: 'Special Characters: åäö & <>"\'',
      content: 'Content with special chars: @#$%^&*()_+ 中文 العربية 🚀🎉'
    };

    const result = await createBlogPost(specialCharsInput);

    expect(result.title).toEqual(specialCharsInput.title);
    expect(result.content).toEqual(specialCharsInput.content);
    expect(result.id).toBeDefined();

    // Verify in database
    const saved = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(saved[0].title).toEqual(specialCharsInput.title);
    expect(saved[0].content).toEqual(specialCharsInput.content);
  });

  it('should create multiple blog posts with unique IDs', async () => {
    const input1: CreateBlogPostInput = {
      title: 'First Post',
      content: 'First post content'
    };

    const input2: CreateBlogPostInput = {
      title: 'Second Post',
      content: 'Second post content'
    };

    const result1 = await createBlogPost(input1);
    const result2 = await createBlogPost(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.title).toEqual('First Post');
    expect(result2.title).toEqual('Second Post');
    
    // Both should be saved in database
    const allPosts = await db.select()
      .from(blogPostsTable)
      .execute();

    expect(allPosts).toHaveLength(2);
    
    const titles = allPosts.map(post => post.title);
    expect(titles).toContain('First Post');
    expect(titles).toContain('Second Post');
  });

  it('should set created_at and updated_at timestamps', async () => {
    const beforeCreation = new Date();
    
    const result = await createBlogPost(testInput);
    
    const afterCreation = new Date();

    // Timestamps should be within reasonable range
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000);
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000);
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);

    // For new posts, created_at and updated_at should be very close
    const timeDiff = Math.abs(result.updated_at.getTime() - result.created_at.getTime());
    expect(timeDiff).toBeLessThan(1000); // Less than 1 second difference
  });
});