import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { booksTable } from '../db/schema';
import { type UpdateBookInput, type CreateBookInput } from '../schema';
import { updateBook } from '../handlers/update_book';
import { eq } from 'drizzle-orm';

// Helper function to create a test book
const createTestBook = async (): Promise<number> => {
  const testBook: CreateBookInput = {
    title: 'Original Title',
    authors: 'Original Author',
    genre: 'Science Fiction',
    description: 'Original description',
    cover_image_url: 'https://example.com/cover.jpg',
    content: 'Original content',
    section: 'mind_and_machine'
  };

  const result = await db.insert(booksTable)
    .values({
      ...testBook,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateBook', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a single field', async () => {
    const bookId = await createTestBook();
    
    const updateInput: UpdateBookInput = {
      id: bookId,
      title: 'Updated Title'
    };

    const result = await updateBook(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toBe(bookId);
    expect(result!.title).toBe('Updated Title');
    expect(result!.authors).toBe('Original Author'); // Should remain unchanged
    expect(result!.genre).toBe('Science Fiction'); // Should remain unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update multiple fields', async () => {
    const bookId = await createTestBook();
    
    const updateInput: UpdateBookInput = {
      id: bookId,
      title: 'New Title',
      authors: 'New Author, Second Author',
      genre: 'Fantasy',
      description: 'New description'
    };

    const result = await updateBook(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toBe(bookId);
    expect(result!.title).toBe('New Title');
    expect(result!.authors).toBe('New Author, Second Author');
    expect(result!.genre).toBe('Fantasy');
    expect(result!.description).toBe('New description');
    expect(result!.content).toBe('Original content'); // Should remain unchanged
    expect(result!.section).toBe('mind_and_machine'); // Should remain unchanged
  });

  it('should update cover_image_url to null', async () => {
    const bookId = await createTestBook();
    
    const updateInput: UpdateBookInput = {
      id: bookId,
      cover_image_url: null
    };

    const result = await updateBook(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toBe(bookId);
    expect(result!.cover_image_url).toBeNull();
    expect(result!.title).toBe('Original Title'); // Should remain unchanged
  });

  it('should update section field', async () => {
    const bookId = await createTestBook();
    
    const updateInput: UpdateBookInput = {
      id: bookId,
      section: 'veridion_writers_coop'
    };

    const result = await updateBook(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toBe(bookId);
    expect(result!.section).toBe('veridion_writers_coop');
    expect(result!.title).toBe('Original Title'); // Should remain unchanged
  });

  it('should update all fields at once', async () => {
    const bookId = await createTestBook();
    
    const updateInput: UpdateBookInput = {
      id: bookId,
      title: 'Completely New Title',
      authors: 'New Author Team',
      genre: 'Horror',
      description: 'Completely new description',
      cover_image_url: 'https://newsite.com/newcover.jpg',
      content: 'Completely new content',
      section: 'veridion_writers_coop'
    };

    const result = await updateBook(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toBe(bookId);
    expect(result!.title).toBe('Completely New Title');
    expect(result!.authors).toBe('New Author Team');
    expect(result!.genre).toBe('Horror');
    expect(result!.description).toBe('Completely new description');
    expect(result!.cover_image_url).toBe('https://newsite.com/newcover.jpg');
    expect(result!.content).toBe('Completely new content');
    expect(result!.section).toBe('veridion_writers_coop');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent book', async () => {
    const updateInput: UpdateBookInput = {
      id: 99999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateBook(updateInput);

    expect(result).toBeNull();
  });

  it('should update the updated_at timestamp', async () => {
    const bookId = await createTestBook();
    
    // Get original updated_at timestamp
    const originalBook = await db.select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId))
      .execute();
    
    const originalUpdatedAt = originalBook[0].updated_at;
    
    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const updateInput: UpdateBookInput = {
      id: bookId,
      title: 'Updated Title'
    };

    const result = await updateBook(updateInput);

    expect(result).toBeDefined();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should save changes to database', async () => {
    const bookId = await createTestBook();
    
    const updateInput: UpdateBookInput = {
      id: bookId,
      title: 'Database Test Title',
      genre: 'Mystery'
    };

    await updateBook(updateInput);

    // Verify changes were saved to database
    const savedBook = await db.select()
      .from(booksTable)
      .where(eq(booksTable.id, bookId))
      .execute();

    expect(savedBook).toHaveLength(1);
    expect(savedBook[0].title).toBe('Database Test Title');
    expect(savedBook[0].genre).toBe('Mystery');
    expect(savedBook[0].authors).toBe('Original Author'); // Should remain unchanged
    expect(savedBook[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle empty update gracefully', async () => {
    const bookId = await createTestBook();
    
    const updateInput: UpdateBookInput = {
      id: bookId
      // No fields to update, only updated_at should change
    };

    const result = await updateBook(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toBe(bookId);
    expect(result!.title).toBe('Original Title'); // Should remain unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});