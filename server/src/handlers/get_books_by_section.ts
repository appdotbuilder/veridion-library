import { db } from '../db';
import { booksTable } from '../db/schema';
import { type GetBooksBySectionInput, type Book } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getBooksBySection = async (input: GetBooksBySectionInput): Promise<Book[]> => {
  try {
    // Query books filtered by section, ordered by creation date (newest first)
    const results = await db.select()
      .from(booksTable)
      .where(eq(booksTable.section, input.section))
      .orderBy(desc(booksTable.created_at))
      .execute();

    // Return the results - no numeric conversions needed for this table
    return results;
  } catch (error) {
    console.error('Get books by section failed:', error);
    throw error;
  }
};