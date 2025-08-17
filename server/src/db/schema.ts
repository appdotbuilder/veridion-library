import { serial, text, pgTable, timestamp, numeric, integer, real } from 'drizzle-orm/pg-core';

export const itemsTable = pgTable('items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'), // Nullable by default
  image_url: text('image_url'), // Nullable by default
  category: text('category'), // Nullable by default
  price: numeric('price', { precision: 10, scale: 2 }), // Nullable monetary value with precision
  rating: real('rating'), // Nullable floating point for ratings (0-5)
  external_id: text('external_id').notNull(), // ID from external source
  source_url: text('source_url').notNull(), // URL of the external source
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type Item = typeof itemsTable.$inferSelect; // For SELECT operations
export type NewItem = typeof itemsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { items: itemsTable };