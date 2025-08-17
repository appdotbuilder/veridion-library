import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBlogPost = async (input: UpdateBlogPostInput): Promise<BlogPost | null> => {
  try {
    // Build the update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.title !== undefined) {
      updateData['title'] = input.title;
    }

    if (input.content !== undefined) {
      updateData['content'] = input.content;
    }

    // Update the blog post and return the updated record
    const result = await db.update(blogPostsTable)
      .set(updateData)
      .where(eq(blogPostsTable.id, input.id))
      .returning()
      .execute();

    // Return null if no record was updated (blog post not found)
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Blog post update failed:', error);
    throw error;
  }
};