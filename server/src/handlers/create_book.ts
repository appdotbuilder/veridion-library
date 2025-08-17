import { db } from '../db';
import { booksTable } from '../db/schema';
import { type CreateBookInput, type Book } from '../schema';

export const createBook = async (input: CreateBookInput): Promise<Book> => {
  try {
    // Insert book record
    const result = await db.insert(booksTable)
      .values({
        title: input.title,
        authors: input.authors,
        genre: input.genre,
        description: input.description,
        cover_image_url: input.cover_image_url,
        content: input.content,
        section: input.section
        // created_at and updated_at will be auto-set by database defaults
      })
      .returning()
      .execute();

    // Return the created book
    const book = result[0];
    return book;
  } catch (error) {
    console.error('Book creation failed:', error);
    throw error;
  }
};