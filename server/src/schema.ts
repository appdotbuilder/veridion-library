import { z } from 'zod';

// Blog post schema
export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// Input schema for creating blog posts
export const createBlogPostInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required")
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;

// Input schema for updating blog posts
export const updateBlogPostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional()
});

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostInputSchema>;

// Input schema for getting a single blog post by ID
export const getBlogPostInputSchema = z.object({
  id: z.number()
});

export type GetBlogPostInput = z.infer<typeof getBlogPostInputSchema>;