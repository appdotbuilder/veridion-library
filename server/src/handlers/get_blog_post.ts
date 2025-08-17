import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostInput, type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export const getBlogPost = async (input: GetBlogPostInput): Promise<BlogPost | null> => {
  try {
    // Query for a single blog post by ID
    const result = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .execute();

    // Return the first result or null if not found
    return result[0] || null;
  } catch (error) {
    console.error('Blog post fetch failed:', error);
    throw error;
  }
};