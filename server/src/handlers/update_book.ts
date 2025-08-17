import { db } from '../db';
import { booksTable } from '../db/schema';
import { type UpdateBookInput, type Book } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBook = async (input: UpdateBookInput): Promise<Book | null> => {
  try {
    // First check if the book exists
    const existingBook = await db.select()
      .from(booksTable)
      .where(eq(booksTable.id, input.id))
      .execute();

    if (existingBook.length === 0) {
      return null; // Book not found
    }

    // Extract id and create update object with only provided fields
    const { id, ...updateFields } = input;
    
    // Only include fields that are defined
    const fieldsToUpdate: Partial<typeof booksTable.$inferInsert> = {};
    
    if (updateFields.title !== undefined) {
      fieldsToUpdate.title = updateFields.title;
    }
    if (updateFields.authors !== undefined) {
      fieldsToUpdate.authors = updateFields.authors;
    }
    if (updateFields.genre !== undefined) {
      fieldsToUpdate.genre = updateFields.genre;
    }
    if (updateFields.description !== undefined) {
      fieldsToUpdate.description = updateFields.description;
    }
    if (updateFields.cover_image_url !== undefined) {
      fieldsToUpdate.cover_image_url = updateFields.cover_image_url;
    }
    if (updateFields.content !== undefined) {
      fieldsToUpdate.content = updateFields.content;
    }
    if (updateFields.section !== undefined) {
      fieldsToUpdate.section = updateFields.section;
    }

    // Always update the updated_at timestamp
    fieldsToUpdate.updated_at = new Date();

    // Update the book record
    const result = await db.update(booksTable)
      .set(fieldsToUpdate)
      .where(eq(booksTable.id, id))
      .returning()
      .execute();

    return result[0] || null;
  } catch (error) {
    console.error('Book update failed:', error);
    throw error;
  }
};