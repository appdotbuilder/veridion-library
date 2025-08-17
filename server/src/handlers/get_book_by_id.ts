import { db } from '../db';
import { booksTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetBookByIdInput, type Book } from '../schema';

export const getBookById = async (input: GetBookByIdInput): Promise<Book | null> => {
  try {
    // Query for the book by ID
    const result = await db.select()
      .from(booksTable)
      .where(eq(booksTable.id, input.id))
      .execute();

    // Return null if book not found
    if (result.length === 0) {
      return null;
    }

    // Return the book - no numeric conversion needed as all fields are text/timestamps
    return result[0];
  } catch (error) {
    console.error('Get book by ID failed:', error);
    throw error;
  }
};