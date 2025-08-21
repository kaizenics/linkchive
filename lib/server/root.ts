import { createTRPCRouter } from '@/lib/trpc';
import { linksRouter } from './routers/links';
import { foldersRouter } from './routers/folders';
import { utilsRouter } from './routers/utils';

/**
 * This is the primary router for your server.
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  links: linksRouter,
  folders: foldersRouter,
  utils: utilsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
