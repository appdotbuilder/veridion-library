import { z } from 'zod';

// Item schema for external API data
export const itemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  category: z.string().nullable(),
  price: z.number().nullable(),
  rating: z.number().min(0).max(5).nullable(),
  external_id: z.string(), // ID from external source
  source_url: z.string().url(), // URL of the external source
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Item = z.infer<typeof itemSchema>;

// Input schema for creating items from external data
export const createItemInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  category: z.string().nullable(),
  price: z.number().positive().nullable(),
  rating: z.number().min(0).max(5).nullable(),
  external_id: z.string(),
  source_url: z.string().url()
});

export type CreateItemInput = z.infer<typeof createItemInputSchema>;

// Input schema for updating items
export const updateItemInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  category: z.string().nullable().optional(),
  price: z.number().positive().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  external_id: z.string().optional(),
  source_url: z.string().url().optional()
});

export type UpdateItemInput = z.infer<typeof updateItemInputSchema>;

// Query parameters for filtering items
export const getItemsQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  minRating: z.number().min(0).max(5).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type GetItemsQuery = z.infer<typeof getItemsQuerySchema>;

// Schema for external API response (generic structure)
export const externalItemSchema = z.object({
  id: z.union([z.string(), z.number()]), // External APIs might use string or number IDs
  title: z.string(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  category: z.string().optional(),
  price: z.number().optional(),
  rating: z.object({
    rate: z.number(),
    count: z.number().optional()
  }).optional()
});

export type ExternalItem = z.infer<typeof externalItemSchema>;

// Response schema for paginated items
export const paginatedItemsSchema = z.object({
  items: z.array(itemSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  hasMore: z.boolean()
});

export type PaginatedItems = z.infer<typeof paginatedItemsSchema>;