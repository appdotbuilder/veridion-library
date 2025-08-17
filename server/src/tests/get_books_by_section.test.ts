import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { booksTable } from '../db/schema';
import { type GetBooksBySectionInput } from '../schema';
import { getBooksBySection } from '../handlers/get_books_by_section';

// Test book data for mind_and_machine section
const aiBookInput = {
  title: 'The Future of AI',
  authors: 'Claude AI, GPT-4',
  genre: 'Science Fiction',
  description: 'An exploration of artificial intelligence and its implications for humanity.',
  cover_image_url: 'https://example.com/ai-book-cover.jpg',
  content: 'In the year 2045, artificial intelligence had evolved beyond human comprehension...',
  section: 'mind_and_machine' as const
};

// Test book data for veridion_writers_coop section
const coopBookInput = {
  title: 'Community Tales',
  authors: 'Jane Doe, John Smith',
  genre: 'Fantasy',
  description: 'A collection of stories from the Veridion Writers Cooperative.',
  cover_image_url: null,
  content: 'Once upon a time in a distant realm, there lived a group of writers...',
  section: 'veridion_writers_coop' as const
};

// Another AI book for testing ordering
const secondAiBookInput = {
  title: 'Machine Dreams',
  authors: 'Artificial Mind',
  genre: 'Philosophy',
  description: 'Do machines dream? An AI perspective on consciousness.',
  cover_image_url: 'https://example.com/machine-dreams.jpg',
  content: 'The question of machine consciousness has puzzled philosophers...',
  section: 'mind_and_machine' as const
};

describe('getBooksBySection', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return books from mind_and_machine section only', async () => {
    // Insert test books from both sections
    await db.insert(booksTable).values([
      aiBookInput,
      coopBookInput,
      secondAiBookInput
    ]).execute();

    const input: GetBooksBySectionInput = {
      section: 'mind_and_machine'
    };

    const result = await getBooksBySection(input);

    // Should return only AI books
    expect(result).toHaveLength(2);
    result.forEach(book => {
      expect(book.section).toEqual('mind_and_machine');
    });

    // Verify specific book data
    const titles = result.map(book => book.title);
    expect(titles).toContain('The Future of AI');
    expect(titles).toContain('Machine Dreams');
    expect(titles).not.toContain('Community Tales');
  });

  it('should return books from veridion_writers_coop section only', async () => {
    // Insert test books from both sections
    await db.insert(booksTable).values([
      aiBookInput,
      coopBookInput,
      secondAiBookInput
    ]).execute();

    const input: GetBooksBySectionInput = {
      section: 'veridion_writers_coop'
    };

    const result = await getBooksBySection(input);

    // Should return only coop books
    expect(result).toHaveLength(1);
    expect(result[0].section).toEqual('veridion_writers_coop');
    expect(result[0].title).toEqual('Community Tales');
    expect(result[0].authors).toEqual('Jane Doe, John Smith');
    expect(result[0].cover_image_url).toBeNull();
  });

  it('should return empty array when section has no books', async () => {
    // Insert only AI books
    await db.insert(booksTable).values([aiBookInput]).execute();

    const input: GetBooksBySectionInput = {
      section: 'veridion_writers_coop'
    };

    const result = await getBooksBySection(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return books ordered by creation date (newest first)', async () => {
    // Insert first book
    await db.insert(booksTable).values([aiBookInput]).execute();
    
    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Insert second book
    await db.insert(booksTable).values([secondAiBookInput]).execute();

    const input: GetBooksBySectionInput = {
      section: 'mind_and_machine'
    };

    const result = await getBooksBySection(input);

    expect(result).toHaveLength(2);
    
    // Verify ordering - newest first
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[0].created_at.getTime()).toBeGreaterThanOrEqual(result[1].created_at.getTime());
    
    // The second book inserted should be first in results
    expect(result[0].title).toEqual('Machine Dreams');
    expect(result[1].title).toEqual('The Future of AI');
  });

  it('should return all book fields correctly', async () => {
    await db.insert(booksTable).values([aiBookInput]).execute();

    const input: GetBooksBySectionInput = {
      section: 'mind_and_machine'
    };

    const result = await getBooksBySection(input);

    expect(result).toHaveLength(1);
    
    const book = result[0];
    expect(book.id).toBeDefined();
    expect(typeof book.id).toEqual('number');
    expect(book.title).toEqual('The Future of AI');
    expect(book.authors).toEqual('Claude AI, GPT-4');
    expect(book.genre).toEqual('Science Fiction');
    expect(book.description).toEqual('An exploration of artificial intelligence and its implications for humanity.');
    expect(book.cover_image_url).toEqual('https://example.com/ai-book-cover.jpg');
    expect(book.content).toEqual('In the year 2045, artificial intelligence had evolved beyond human comprehension...');
    expect(book.section).toEqual('mind_and_machine');
    expect(book.created_at).toBeInstanceOf(Date);
    expect(book.updated_at).toBeInstanceOf(Date);
  });
});