import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc';
import { db } from '@/db';
import { links } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const linksRouter = createTRPCRouter({
  // Get all links for the authenticated user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(links)
      .where(eq(links.userId, ctx.userId))
      .orderBy(desc(links.createdAt));
  }),

  // Get a specific link by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const link = await db
        .select()
        .from(links)
        .where(and(eq(links.id, input.id), eq(links.userId, ctx.userId)))
        .limit(1);
      
      return link[0] || null;
    }),

  // Create a new link
  create: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        title: z.string().min(1),
        label: z.string().min(1),
        folderId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [newLink] = await db
        .insert(links)
        .values({
          ...input,
          userId: ctx.userId,
        })
        .returning();
      
      return newLink;
    }),

  // Update a link
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        url: z.string().url().optional(),
        title: z.string().min(1).optional(),
        label: z.string().min(1).optional(),
        folderId: z.number().optional(),
        isFavorite: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      
      const [updatedLink] = await db
        .update(links)
        .set(updateData)
        .where(and(eq(links.id, id), eq(links.userId, ctx.userId)))
        .returning();
      
      return updatedLink;
    }),

  // Delete a link
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(links)
        .where(and(eq(links.id, input.id), eq(links.userId, ctx.userId)));
      
      return { success: true };
    }),

  // Toggle favorite status
  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // First get the current favorite status
      const link = await db
        .select({ isFavorite: links.isFavorite })
        .from(links)
        .where(and(eq(links.id, input.id), eq(links.userId, ctx.userId)))
        .limit(1);
      
      if (!link[0]) {
        throw new Error('Link not found');
      }
      
      const [updatedLink] = await db
        .update(links)
        .set({ isFavorite: !link[0].isFavorite })
        .where(and(eq(links.id, input.id), eq(links.userId, ctx.userId)))
        .returning();
      
      return updatedLink;
    }),

  // Get favorite links
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(links)
      .where(and(eq(links.userId, ctx.userId), eq(links.isFavorite, true)))
      .orderBy(desc(links.createdAt));
  }),

  // Get links by folder
  getByFolder: protectedProcedure
    .input(z.object({ folderId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await db
        .select()
        .from(links)
        .where(
          and(
            eq(links.userId, ctx.userId),
            eq(links.folderId, input.folderId)
          )
        )
        .orderBy(desc(links.createdAt));
    }),
});
