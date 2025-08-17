import { serial, text, pgTable, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Define the book section enum
export const bookSectionEnum = pgEnum('book_section', ['mind_and_machine', 'veridion_writers_coop']);

// Books table schema
export const booksTable = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authors: text('authors').notNull(), // Comma-separated authors string
  genre: text('genre').notNull(),
  description: text('description').notNull(),
  cover_image_url: text('cover_image_url'), // Nullable by default, matches Zod schema
  content: text('content').notNull(), // Full book content
  section: bookSectionEnum('section').notNull(), // Must be one of the enum values
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schema
export type Book = typeof booksTable.$inferSelect; // For SELECT operations
export type NewBook = typeof booksTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { books: booksTable };