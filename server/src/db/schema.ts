import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const blogPostsTable = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript type for the table schema
export type BlogPost = typeof blogPostsTable.$inferSelect; // For SELECT operations
export type NewBlogPost = typeof blogPostsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { blogPosts: blogPostsTable };