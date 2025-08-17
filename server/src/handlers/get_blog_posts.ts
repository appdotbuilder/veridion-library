import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type BlogPost } from '../schema';
import { desc } from 'drizzle-orm';

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    // Fetch all blog posts ordered by creation date (newest first)
    const results = await db.select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    throw error;
  }
};