import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { getBlogPosts } from '../handlers/get_blog_posts';

describe('getBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no blog posts exist', async () => {
    const result = await getBlogPosts();
    
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all blog posts', async () => {
    // Create test blog posts
    await db.insert(blogPostsTable).values([
      {
        title: 'First Post',
        content: 'Content of the first post'
      },
      {
        title: 'Second Post', 
        content: 'Content of the second post'
      }
    ]).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(2);
    
    // Verify all required fields are present
    result.forEach(post => {
      expect(post.id).toBeDefined();
      expect(typeof post.title).toBe('string');
      expect(typeof post.content).toBe('string');
      expect(post.created_at).toBeInstanceOf(Date);
      expect(post.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific content
    const titles = result.map(post => post.title);
    expect(titles).toContain('First Post');
    expect(titles).toContain('Second Post');
  });

  it('should return blog posts ordered by creation date (newest first)', async () => {
    // Create first post
    const firstPost = await db.insert(blogPostsTable).values({
      title: 'Older Post',
      content: 'This was created first'
    }).returning().execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second post  
    const secondPost = await db.insert(blogPostsTable).values({
      title: 'Newer Post',
      content: 'This was created second'
    }).returning().execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(2);
    
    // First result should be the newer post
    expect(result[0].title).toBe('Newer Post');
    expect(result[1].title).toBe('Older Post');
    
    // Verify ordering by comparing timestamps
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle multiple blog posts with same creation time', async () => {
    // Create multiple posts at the same time
    await db.insert(blogPostsTable).values([
      {
        title: 'Post A',
        content: 'Content A'
      },
      {
        title: 'Post B',
        content: 'Content B'
      },
      {
        title: 'Post C',
        content: 'Content C'
      }
    ]).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(3);
    
    // All posts should be returned with proper structure
    result.forEach(post => {
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('created_at');
      expect(post).toHaveProperty('updated_at');
    });

    // Verify all titles are present
    const titles = result.map(post => post.title);
    expect(titles).toContain('Post A');
    expect(titles).toContain('Post B');
    expect(titles).toContain('Post C');
  });

  it('should preserve all blog post data fields', async () => {
    const testPost = {
      title: 'Test Blog Post',
      content: 'This is a comprehensive test of blog post content with multiple sentences. It should preserve all formatting and content exactly as stored.'
    };

    await db.insert(blogPostsTable).values(testPost).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(1);
    
    const post = result[0];
    expect(post.title).toBe(testPost.title);
    expect(post.content).toBe(testPost.content);
    expect(post.id).toBeGreaterThan(0);
    expect(post.created_at).toBeInstanceOf(Date);
    expect(post.updated_at).toBeInstanceOf(Date);
    
    // Verify timestamps are reasonable (within last minute)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    expect(post.created_at >= oneMinuteAgo).toBe(true);
    expect(post.updated_at >= oneMinuteAgo).toBe(true);
  });
});