import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc';
import { db } from '@/db';
import { folders, links } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const foldersRouter = createTRPCRouter({
  // Get all folders for the authenticated user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(folders)
      .where(eq(folders.userId, ctx.userId))
      .orderBy(desc(folders.createdAt));
  }),

  // Get a specific folder by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const folder = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, input.id), eq(folders.userId, ctx.userId)))
        .limit(1);
      
      return folder[0] || null;
    }),

  // Create a new folder
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Folder name is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [newFolder] = await db
        .insert(folders)
        .values({
          name: input.name,
          userId: ctx.userId,
        })
        .returning();
      
      return newFolder;
    }),

  // Update a folder
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      
      const [updatedFolder] = await db
        .update(folders)
        .set(updateData)
        .where(and(eq(folders.id, id), eq(folders.userId, ctx.userId)))
        .returning();
      
      return updatedFolder;
    }),

  // Delete a folder
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // First, remove folder reference from all links in this folder
      await db
        .update(links)
        .set({ folderId: null })
        .where(
          and(
            eq(links.folderId, input.id),
            eq(links.userId, ctx.userId)
          )
        );
      
      // Then delete the folder
      await db
        .delete(folders)
        .where(and(eq(folders.id, input.id), eq(folders.userId, ctx.userId)));
      
      return { success: true };
    }),

  // Toggle pin status
  togglePin: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // First get the current pin status
      const folder = await db
        .select({ isPinned: folders.isPinned })
        .from(folders)
        .where(and(eq(folders.id, input.id), eq(folders.userId, ctx.userId)))
        .limit(1);
      
      if (!folder[0]) {
        throw new Error('Folder not found');
      }
      
      const [updatedFolder] = await db
        .update(folders)
        .set({ isPinned: !folder[0].isPinned })
        .where(and(eq(folders.id, input.id), eq(folders.userId, ctx.userId)))
        .returning();
      
      return updatedFolder;
    }),

  // Get pinned folders
  getPinned: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(folders)
      .where(and(eq(folders.userId, ctx.userId), eq(folders.isPinned, true)))
      .orderBy(desc(folders.createdAt));
  }),

  // Get folder with its links count
  getWithLinksCount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const folder = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, input.id), eq(folders.userId, ctx.userId)))
        .limit(1);
      
      if (!folder[0]) {
        return null;
      }
      
      const linksCount = await db
        .select()
        .from(links)
        .where(
          and(
            eq(links.folderId, input.id),
            eq(links.userId, ctx.userId)
          )
        );
      
      return {
        ...folder[0],
        linksCount: linksCount.length,
      };
    }),
});
