import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createItemInputSchema, 
  updateItemInputSchema, 
  getItemsQuerySchema 
} from './schema';

// Import handlers
import { createItem } from './handlers/create_item';
import { getItems } from './handlers/get_items';
import { getItemById } from './handlers/get_item_by_id';
import { updateItem } from './handlers/update_item';
import { deleteItem } from './handlers/delete_item';
import { fetchExternalItems, syncItemsFromExternal } from './handlers/fetch_external_items';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Create a new item
  createItem: publicProcedure
    .input(createItemInputSchema)
    .mutation(({ input }) => createItem(input)),

  // Get items with optional filtering and pagination
  getItems: publicProcedure
    .input(getItemsQuerySchema)
    .query(({ input }) => getItems(input)),

  // Get a single item by ID
  getItemById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(({ input }) => getItemById(input.id)),

  // Update an existing item
  updateItem: publicProcedure
    .input(updateItemInputSchema)
    .mutation(({ input }) => updateItem(input)),

  // Delete an item by ID
  deleteItem: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(({ input }) => deleteItem(input.id)),

  // Fetch items from external source
  fetchExternalItems: publicProcedure
    .input(z.object({ sourceUrl: z.string().url() }))
    .query(({ input }) => fetchExternalItems(input.sourceUrl)),

  // Sync items from external source to database
  syncItemsFromExternal: publicProcedure
    .input(z.object({ sourceUrl: z.string().url() }))
    .mutation(({ input }) => syncItemsFromExternal(input.sourceUrl)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();