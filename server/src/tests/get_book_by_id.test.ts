import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { booksTable } from '../db/schema';
import { type GetBookByIdInput, type CreateBookInput } from '../schema';
import { getBookById } from '../handlers/get_book_by_id';

// Test book data
const testBookData: CreateBookInput = {
  title: 'The Digital Mind',
  authors: 'Jane Doe, John Smith',
  genre: 'Science Fiction',
  description: 'A fascinating exploration of artificial consciousness and digital minds.',
  cover_image_url: 'https://example.com/cover.jpg',
  content: 'Chapter 1: The Beginning\n\nIn the year 2050, artificial consciousness became reality...',
  section: 'mind_and_machine'
};

describe('getBookById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a book when found', async () => {
    // Create a test book
    const insertResult = await db.insert(booksTable)
      .values({
        title: testBookData.title,
        authors: testBookData.authors,
        genre: testBookData.genre,
        description: testBookData.description,
        cover_image_url: testBookData.cover_image_url,
        content: testBookData.content,
        section: testBookData.section
      })
      .returning()
      .execute();

    const createdBook = insertResult[0];
    const input: GetBookByIdInput = { id: createdBook.id };

    const result = await getBookById(input);

    // Verify the book was found and all fields are correct
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdBook.id);
    expect(result!.title).toEqual('The Digital Mind');
    expect(result!.authors).toEqual('Jane Doe, John Smith');
    expect(result!.genre).toEqual('Science Fiction');
    expect(result!.description).toEqual('A fascinating exploration of artificial consciousness and digital minds.');
    expect(result!.cover_image_url).toEqual('https://example.com/cover.jpg');
    expect(result!.content).toEqual('Chapter 1: The Beginning\n\nIn the year 2050, artificial consciousness became reality...');
    expect(result!.section).toEqual('mind_and_machine');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when book not found', async () => {
    const input: GetBookByIdInput = { id: 999 };

    const result = await getBookById(input);

    expect(result).toBeNull();
  });

  it('should handle book with null cover image', async () => {
    // Create a book without cover image
    const bookWithoutCover: CreateBookInput = {
      ...testBookData,
      cover_image_url: null,
      title: 'Book Without Cover'
    };

    const insertResult = await db.insert(booksTable)
      .values({
        title: bookWithoutCover.title,
        authors: bookWithoutCover.authors,
        genre: bookWithoutCover.genre,
        description: bookWithoutCover.description,
        cover_image_url: bookWithoutCover.cover_image_url,
        content: bookWithoutCover.content,
        section: bookWithoutCover.section
      })
      .returning()
      .execute();

    const createdBook = insertResult[0];
    const input: GetBookByIdInput = { id: createdBook.id };

    const result = await getBookById(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Book Without Cover');
    expect(result!.cover_image_url).toBeNull();
    expect(result!.section).toEqual('mind_and_machine');
  });

  it('should handle different book sections', async () => {
    // Create a book in veridion_writers_coop section
    const coopBookData: CreateBookInput = {
      ...testBookData,
      title: 'Writers Collective Stories',
      section: 'veridion_writers_coop'
    };

    const insertResult = await db.insert(booksTable)
      .values({
        title: coopBookData.title,
        authors: coopBookData.authors,
        genre: coopBookData.genre,
        description: coopBookData.description,
        cover_image_url: coopBookData.cover_image_url,
        content: coopBookData.content,
        section: coopBookData.section
      })
      .returning()
      .execute();

    const createdBook = insertResult[0];
    const input: GetBookByIdInput = { id: createdBook.id };

    const result = await getBookById(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Writers Collective Stories');
    expect(result!.section).toEqual('veridion_writers_coop');
  });

  it('should return complete book content for reading', async () => {
    // Test with extensive content
    const longContentBook: CreateBookInput = {
      ...testBookData,
      title: 'Complete Novel',
      content: 'Chapter 1: Introduction\nThis is the first chapter with lots of content.\n\nChapter 2: Development\nThe story develops here with character growth.\n\nChapter 3: Climax\nThe exciting conclusion approaches.\n\nChapter 4: Resolution\nAll loose ends are tied up.'
    };

    const insertResult = await db.insert(booksTable)
      .values({
        title: longContentBook.title,
        authors: longContentBook.authors,
        genre: longContentBook.genre,
        description: longContentBook.description,
        cover_image_url: longContentBook.cover_image_url,
        content: longContentBook.content,
        section: longContentBook.section
      })
      .returning()
      .execute();

    const createdBook = insertResult[0];
    const input: GetBookByIdInput = { id: createdBook.id };

    const result = await getBookById(input);

    expect(result).not.toBeNull();
    expect(result!.content).toContain('Chapter 1: Introduction');
    expect(result!.content).toContain('Chapter 2: Development');
    expect(result!.content).toContain('Chapter 3: Climax');
    expect(result!.content).toContain('Chapter 4: Resolution');
    expect(result!.content.length).toBeGreaterThan(100);
  });
});