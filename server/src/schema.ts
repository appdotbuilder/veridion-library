import { z } from 'zod';

// Enum for book sections
export const bookSectionSchema = z.enum(['mind_and_machine', 'veridion_writers_coop']);
export type BookSection = z.infer<typeof bookSectionSchema>;

// Book schema with proper field handling
export const bookSchema = z.object({
  id: z.number(),
  title: z.string(),
  authors: z.string(), // Comma-separated authors string
  genre: z.string(),
  description: z.string(),
  cover_image_url: z.string().nullable(), // Optional cover image
  content: z.string(), // Full book content
  section: bookSectionSchema, // Either 'mind_and_machine' or 'veridion_writers_coop'
  created_at: z.coerce.date(), // Automatically converts string timestamps to Date objects
  updated_at: z.coerce.date()
});

export type Book = z.infer<typeof bookSchema>;

// Input schema for creating books
export const createBookInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  authors: z.string().min(1, "At least one author is required"),
  genre: z.string().min(1, "Genre is required"),
  description: z.string().min(1, "Description is required"),
  cover_image_url: z.string().url().nullable(), // Valid URL or null
  content: z.string().min(1, "Content is required"),
  section: bookSectionSchema
});

export type CreateBookInput = z.infer<typeof createBookInputSchema>;

// Input schema for updating books
export const updateBookInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  authors: z.string().min(1).optional(),
  genre: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  cover_image_url: z.string().url().nullable().optional(),
  content: z.string().min(1).optional(),
  section: bookSectionSchema.optional()
});

export type UpdateBookInput = z.infer<typeof updateBookInputSchema>;

// Schema for getting books by section
export const getBooksBySectionInputSchema = z.object({
  section: bookSectionSchema
});

export type GetBooksBySectionInput = z.infer<typeof getBooksBySectionInputSchema>;

// Schema for getting a single book by ID
export const getBookByIdInputSchema = z.object({
  id: z.number()
});

export type GetBookByIdInput = z.infer<typeof getBookByIdInputSchema>;