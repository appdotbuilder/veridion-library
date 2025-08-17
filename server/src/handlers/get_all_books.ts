import { db } from '../db';
import { booksTable } from '../db/schema';
import { type Book } from '../schema';
import { desc } from 'drizzle-orm';

export const getAllBooks = async (): Promise<Book[]> => {
  try {
    // Fetch all books ordered by creation date (newest first)
    const results = await db.select()
      .from(booksTable)
      .orderBy(desc(booksTable.created_at))
      .execute();

    // Return the results as-is since no numeric conversions are needed
    // The Book schema handles date coercion automatically
    return results;
  } catch (error) {
    console.error('Failed to fetch all books:', error);
    throw error;
  }
};