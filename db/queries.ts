import { eq, desc, and, or, like } from "drizzle-orm";
import { db } from "./index";
import { links, type Link, type NewLink } from "./schema";

// Get all links for a specific user
export async function getLinksByUserId(userId: string): Promise<Link[]> {
  return await db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.createdAt));
}

// Create a new link
export async function createLink(data: Omit<NewLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<Link> {
  const [newLink] = await db
    .insert(links)
    .values(data)
    .returning();
  
  return newLink;
}

// Update a link
export async function updateLink(
  id: number, 
  userId: string, 
  data: Partial<Pick<NewLink, 'url' | 'title' | 'label'>>
): Promise<Link | null> {
  const [updatedLink] = await db
    .update(links)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .returning();
  
  return updatedLink || null;
}

// Delete a link
export async function deleteLink(id: number, userId: string): Promise<boolean> {
  const result = await db
    .delete(links)
    .where(and(eq(links.id, id), eq(links.userId, userId)));
  
  return result.rowsAffected > 0;
}

// Search links for a user
export async function searchLinks(userId: string, query: string): Promise<Link[]> {
  const searchTerm = `%${query}%`;
  
  return await db
    .select()
    .from(links)
    .where(
      and(
        eq(links.userId, userId),
        or(
          like(links.title, searchTerm),
          like(links.url, searchTerm),
          like(links.label, searchTerm)
        )
      )
    )
    .orderBy(desc(links.createdAt));
}

// Get a single link by ID and user ID
export async function getLinkById(id: number, userId: string): Promise<Link | null> {
  const [link] = await db
    .select()
    .from(links)
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .limit(1);
  
  return link || null;
}
