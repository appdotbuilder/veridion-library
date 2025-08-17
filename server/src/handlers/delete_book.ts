import { db } from '../db';
import { booksTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetBookByIdInput } from '../schema';

export const deleteBook = async (input: GetBookByIdInput): Promise<boolean> => {
  try {
    // Delete the book with the specified ID
    const result = await db.delete(booksTable)
      .where(eq(booksTable.id, input.id))
      .execute();

    // Check if any rows were affected (book existed and was deleted)
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Book deletion failed:', error);
    throw error;
  }
};