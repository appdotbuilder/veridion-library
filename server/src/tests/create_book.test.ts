import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { booksTable } from '../db/schema';
import { type CreateBookInput } from '../schema';
import { createBook } from '../handlers/create_book';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateBookInput = {
  title: 'The Art of Programming',
  authors: 'John Doe, Jane Smith',
  genre: 'Technology',
  description: 'A comprehensive guide to modern programming practices and methodologies.',
  cover_image_url: 'https://example.com/cover.jpg',
  content: 'Chapter 1: Introduction to Programming\n\nProgramming is the art of...',
  section: 'mind_and_machine'
};

// Test input with null cover image
const testInputNullCover: CreateBookInput = {
  title: 'Mysteries of the Universe',
  authors: 'Carl Sagan',
  genre: 'Science',
  description: 'Exploring the wonders of space and time.',
  cover_image_url: null,
  content: 'The cosmos is vast and mysterious...',
  section: 'veridion_writers_coop'
};

describe('createBook', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a book with all fields', async () => {
    const result = await createBook(testInput);

    // Verify all fields are correctly set
    expect(result.title).toEqual('The Art of Programming');
    expect(result.authors).toEqual('John Doe, Jane Smith');
    expect(result.genre).toEqual('Technology');
    expect(result.description).toEqual('A comprehensive guide to modern programming practices and methodologies.');
    expect(result.cover_image_url).toEqual('https://example.com/cover.jpg');
    expect(result.content).toEqual('Chapter 1: Introduction to Programming\n\nProgramming is the art of...');
    expect(result.section).toEqual('mind_and_machine');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a book with null cover image', async () => {
    const result = await createBook(testInputNullCover);

    expect(result.title).toEqual('Mysteries of the Universe');
    expect(result.authors).toEqual('Carl Sagan');
    expect(result.genre).toEqual('Science');
    expect(result.description).toEqual('Exploring the wonders of space and time.');
    expect(result.cover_image_url).toBeNull();
    expect(result.content).toEqual('The cosmos is vast and mysterious...');
    expect(result.section).toEqual('veridion_writers_coop');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save book to database', async () => {
    const result = await createBook(testInput);

    // Query the database to verify the book was saved
    const books = await db.select()
      .from(booksTable)
      .where(eq(booksTable.id, result.id))
      .execute();

    expect(books).toHaveLength(1);
    const savedBook = books[0];
    
    expect(savedBook.title).toEqual('The Art of Programming');
    expect(savedBook.authors).toEqual('John Doe, Jane Smith');
    expect(savedBook.genre).toEqual('Technology');
    expect(savedBook.description).toEqual('A comprehensive guide to modern programming practices and methodologies.');
    expect(savedBook.cover_image_url).toEqual('https://example.com/cover.jpg');
    expect(savedBook.content).toEqual('Chapter 1: Introduction to Programming\n\nProgramming is the art of...');
    expect(savedBook.section).toEqual('mind_and_machine');
    expect(savedBook.created_at).toBeInstanceOf(Date);
    expect(savedBook.updated_at).toBeInstanceOf(Date);
  });

  it('should handle both book sections correctly', async () => {
    // Create book in 'mind_and_machine' section
    const mindMachineBook = await createBook({
      ...testInput,
      title: 'AI Revolution',
      section: 'mind_and_machine'
    });

    // Create book in 'veridion_writers_coop' section
    const writersCoopBook = await createBook({
      ...testInput,
      title: 'Writers United',
      section: 'veridion_writers_coop'
    });

    expect(mindMachineBook.section).toEqual('mind_and_machine');
    expect(writersCoopBook.section).toEqual('veridion_writers_coop');

    // Verify both are saved correctly in database
    const allBooks = await db.select().from(booksTable).execute();
    expect(allBooks).toHaveLength(2);
    
    const sections = allBooks.map(book => book.section);
    expect(sections).toContain('mind_and_machine');
    expect(sections).toContain('veridion_writers_coop');
  });

  it('should auto-generate timestamps', async () => {
    const beforeCreate = new Date();
    const result = await createBook(testInput);
    const afterCreate = new Date();

    // Verify timestamps are within reasonable range
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000); // Allow 1 second buffer
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime() + 1000);
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000);
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime() + 1000);
    
    // Initially, created_at and updated_at should be very close (same transaction)
    const timeDiff = Math.abs(result.updated_at.getTime() - result.created_at.getTime());
    expect(timeDiff).toBeLessThan(1000); // Should be within 1 second
  });

  it('should create multiple books with unique IDs', async () => {
    const book1 = await createBook({
      ...testInput,
      title: 'First Book'
    });

    const book2 = await createBook({
      ...testInput,
      title: 'Second Book'
    });

    const book3 = await createBook({
      ...testInputNullCover,
      title: 'Third Book'
    });

    // All IDs should be unique
    expect(book1.id).not.toEqual(book2.id);
    expect(book1.id).not.toEqual(book3.id);
    expect(book2.id).not.toEqual(book3.id);

    // Verify all are saved in database
    const allBooks = await db.select().from(booksTable).execute();
    expect(allBooks).toHaveLength(3);
    
    const titles = allBooks.map(book => book.title).sort();
    expect(titles).toEqual(['First Book', 'Second Book', 'Third Book']);
  });
});