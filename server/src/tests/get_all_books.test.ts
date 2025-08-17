import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { booksTable } from '../db/schema';
import { type CreateBookInput } from '../schema';
import { getAllBooks } from '../handlers/get_all_books';

// Test book data
const testBook1: CreateBookInput = {
  title: 'The Machine Mind',
  authors: 'Ada Lovelace, Alan Turing',
  genre: 'Science Fiction',
  description: 'A fascinating exploration of artificial intelligence and consciousness.',
  cover_image_url: 'https://example.com/cover1.jpg',
  content: 'In the year 2045, machines began to dream...',
  section: 'mind_and_machine'
};

const testBook2: CreateBookInput = {
  title: 'Writers of Tomorrow',
  authors: 'Isaac Asimov',
  genre: 'Anthology',
  description: 'A collection of stories from the future of writing.',
  cover_image_url: null,
  content: 'The pen is mightier than the sword, but what about the keyboard?',
  section: 'veridion_writers_coop'
};

const testBook3: CreateBookInput = {
  title: 'Digital Dreams',
  authors: 'Philip K. Dick, William Gibson',
  genre: 'Cyberpunk',
  description: 'What happens when reality becomes optional?',
  cover_image_url: 'https://example.com/cover3.jpg',
  content: 'The matrix was just the beginning...',
  section: 'mind_and_machine'
};

describe('getAllBooks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no books exist', async () => {
    const result = await getAllBooks();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all books when books exist', async () => {
    // Insert test books
    await db.insert(booksTable).values([
      testBook1,
      testBook2,
      testBook3
    ]).execute();

    const result = await getAllBooks();

    expect(result).toHaveLength(3);
    expect(Array.isArray(result)).toBe(true);

    // Verify all books are present
    const titles = result.map(book => book.title);
    expect(titles).toContain('The Machine Mind');
    expect(titles).toContain('Writers of Tomorrow');
    expect(titles).toContain('Digital Dreams');
  });

  it('should return books ordered by creation date (newest first)', async () => {
    // Insert books with slight delay to ensure different timestamps
    await db.insert(booksTable).values(testBook1).execute();
    
    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(booksTable).values(testBook2).execute();
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(booksTable).values(testBook3).execute();

    const result = await getAllBooks();

    expect(result).toHaveLength(3);
    
    // Verify ordering - newest first
    expect(result[0].title).toBe('Digital Dreams'); // Last inserted
    expect(result[1].title).toBe('Writers of Tomorrow'); // Second inserted
    expect(result[2].title).toBe('The Machine Mind'); // First inserted

    // Verify timestamps are in descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
    }
  });

  it('should return complete book objects with all fields', async () => {
    await db.insert(booksTable).values(testBook1).execute();

    const result = await getAllBooks();

    expect(result).toHaveLength(1);
    const book = result[0];

    // Verify all required fields are present
    expect(book.id).toBeDefined();
    expect(typeof book.id).toBe('number');
    expect(book.title).toBe('The Machine Mind');
    expect(book.authors).toBe('Ada Lovelace, Alan Turing');
    expect(book.genre).toBe('Science Fiction');
    expect(book.description).toBe('A fascinating exploration of artificial intelligence and consciousness.');
    expect(book.cover_image_url).toBe('https://example.com/cover1.jpg');
    expect(book.content).toBe('In the year 2045, machines began to dream...');
    expect(book.section).toBe('mind_and_machine');
    expect(book.created_at).toBeInstanceOf(Date);
    expect(book.updated_at).toBeInstanceOf(Date);
  });

  it('should handle books with null cover_image_url', async () => {
    await db.insert(booksTable).values(testBook2).execute();

    const result = await getAllBooks();

    expect(result).toHaveLength(1);
    const book = result[0];

    expect(book.cover_image_url).toBeNull();
    expect(book.title).toBe('Writers of Tomorrow');
  });

  it('should handle books from different sections', async () => {
    await db.insert(booksTable).values([testBook1, testBook2]).execute();

    const result = await getAllBooks();

    expect(result).toHaveLength(2);
    
    const sections = result.map(book => book.section);
    expect(sections).toContain('mind_and_machine');
    expect(sections).toContain('veridion_writers_coop');
  });

  it('should handle large number of books efficiently', async () => {
    // Create multiple books to test performance
    const manyBooks = Array.from({ length: 10 }, (_, i) => ({
      title: `Book ${i + 1}`,
      authors: `Author ${i + 1}`,
      genre: 'Test Genre',
      description: `Description for book ${i + 1}`,
      cover_image_url: i % 2 === 0 ? `https://example.com/cover${i}.jpg` : null,
      content: `Content for book ${i + 1}`,
      section: i % 2 === 0 ? 'mind_and_machine' : 'veridion_writers_coop'
    })) as CreateBookInput[];

    await db.insert(booksTable).values(manyBooks).execute();

    const result = await getAllBooks();

    expect(result).toHaveLength(10);
    expect(Array.isArray(result)).toBe(true);

    // Verify they're still ordered by creation date
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
    }
  });
});