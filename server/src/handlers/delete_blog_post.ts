import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteBlogPost = async (input: GetBlogPostInput): Promise<boolean> => {
  try {
    // Delete the blog post by ID
    const result = await db.delete(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .returning()
      .execute();

    // Return true if a blog post was deleted, false if not found
    return result.length > 0;
  } catch (error) {
    console.error('Blog post deletion failed:', error);
    throw error;
  }
};