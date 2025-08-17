import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { booksTable } from '../db/schema';
import { type GetBookByIdInput, type CreateBookInput } from '../schema';
import { deleteBook } from '../handlers/delete_book';
import { eq } from 'drizzle-orm';

// Test input for creating a book to delete
const testBookInput: CreateBookInput = {
  title: 'Test Book for Deletion',
  authors: 'Test Author',
  genre: 'Fiction',
  description: 'A book created specifically for deletion testing',
  cover_image_url: 'https://example.com/cover.jpg',
  content: 'This is the full content of the test book.',
  section: 'mind_and_machine'
};

// Helper function to create a test book and return its ID
const createTestBook = async (): Promise<number> => {
  const result = await db.insert(booksTable)
    .values({
      title: testBookInput.title,
      authors: testBookInput.authors,
      genre: testBookInput.genre,
      description: testBookInput.description,
      cover_image_url: testBookInput.cover_image_url,
      content: testBookInput.content,
      section: testBookInput.section
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('deleteBook', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing book and return true', async () => {
    // Create a test book
    const bookId = await createTestBook();
    
    // Delete the book
    const deleteInput: GetBookByIdInput = { id: bookId };
    const result = await deleteBook(deleteInput);

    // Should return true for successful deletion
    expect(result).toBe(true);
  });

  it('should remove book from database after deletion', async () => {
    // Create a test book
    const bookId = await createTestBook();
    
    // Verify book exists before deletion
    const beforeDeletion = await db.select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId))
      .execute();
    
    expect(beforeDeletion).toHaveLength(1);

    // Delete the book
    const deleteInput: GetBookByIdInput = { id: bookId };
    await deleteBook(deleteInput);

    // Verify book no longer exists
    const afterDeletion = await db.select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId))
      .execute();
    
    expect(afterDeletion).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent book', async () => {
    // Try to delete a book with an ID that doesn't exist
    const deleteInput: GetBookByIdInput = { id: 99999 };
    const result = await deleteBook(deleteInput);

    // Should return false for non-existent book
    expect(result).toBe(false);
  });

  it('should not affect other books when deleting one book', async () => {
    // Create multiple test books
    const bookId1 = await createTestBook();
    
    const secondBookInput: CreateBookInput = {
      ...testBookInput,
      title: 'Second Test Book',
      authors: 'Second Author',
      section: 'veridion_writers_coop'
    };
    
    const result2 = await db.insert(booksTable)
      .values({
        title: secondBookInput.title,
        authors: secondBookInput.authors,
        genre: secondBookInput.genre,
        description: secondBookInput.description,
        cover_image_url: secondBookInput.cover_image_url,
        content: secondBookInput.content,
        section: secondBookInput.section
      })
      .returning()
      .execute();
    
    const bookId2 = result2[0].id;

    // Delete only the first book
    const deleteInput: GetBookByIdInput = { id: bookId1 };
    const deleteResult = await deleteBook(deleteInput);

    expect(deleteResult).toBe(true);

    // Verify first book is deleted
    const deletedBook = await db.select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId1))
      .execute();
    
    expect(deletedBook).toHaveLength(0);

    // Verify second book still exists
    const remainingBook = await db.select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId2))
      .execute();
    
    expect(remainingBook).toHaveLength(1);
    expect(remainingBook[0].title).toEqual('Second Test Book');
    expect(remainingBook[0].authors).toEqual('Second Author');
    expect(remainingBook[0].section).toEqual('veridion_writers_coop');
  });

  it('should handle deletion of books from different sections', async () => {
    // Create books in different sections
    const mindMachineBookId = await createTestBook(); // Uses 'mind_and_machine'
    
    const coopBookInput: CreateBookInput = {
      ...testBookInput,
      title: 'Writers Coop Book',
      section: 'veridion_writers_coop'
    };
    
    const coopResult = await db.insert(booksTable)
      .values({
        title: coopBookInput.title,
        authors: coopBookInput.authors,
        genre: coopBookInput.genre,
        description: coopBookInput.description,
        cover_image_url: coopBookInput.cover_image_url,
        content: coopBookInput.content,
        section: coopBookInput.section
      })
      .returning()
      .execute();
    
    const coopBookId = coopResult[0].id;

    // Delete the mind_and_machine book
    const deleteInput1: GetBookByIdInput = { id: mindMachineBookId };
    const result1 = await deleteBook(deleteInput1);
    expect(result1).toBe(true);

    // Delete the veridion_writers_coop book
    const deleteInput2: GetBookByIdInput = { id: coopBookId };
    const result2 = await deleteBook(deleteInput2);
    expect(result2).toBe(true);

    // Verify both books are deleted
    const remainingBooks = await db.select()
      .from(booksTable)
      .execute();
    
    expect(remainingBooks).toHaveLength(0);
  });
});