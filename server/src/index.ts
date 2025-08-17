import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createBookInputSchema, 
  updateBookInputSchema,
  getBooksBySectionInputSchema,
  getBookByIdInputSchema 
} from './schema';

// Import handlers
import { createBook } from './handlers/create_book';
import { getAllBooks } from './handlers/get_all_books';
import { getBooksBySection } from './handlers/get_books_by_section';
import { getBookById } from './handlers/get_book_by_id';
import { updateBook } from './handlers/update_book';
import { deleteBook } from './handlers/delete_book';

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

  // Book management endpoints
  createBook: publicProcedure
    .input(createBookInputSchema)
    .mutation(({ input }) => createBook(input)),

  getAllBooks: publicProcedure
    .query(() => getAllBooks()),

  getBooksBySection: publicProcedure
    .input(getBooksBySectionInputSchema)
    .query(({ input }) => getBooksBySection(input)),

  getBookById: publicProcedure
    .input(getBookByIdInputSchema)
    .query(({ input }) => getBookById(input)),

  updateBook: publicProcedure
    .input(updateBookInputSchema)
    .mutation(({ input }) => updateBook(input)),

  deleteBook: publicProcedure
    .input(getBookByIdInputSchema)
    .mutation(({ input }) => deleteBook(input)),
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
  console.log(`The Veridion Library TRPC server listening at port: ${port}`);
}

start();