import { eq, desc, and, or, like, asc, isNull } from "drizzle-orm";
import { db } from "./index";
import { links, folders, type Link, type NewLink, type Folder, type NewFolder } from "./schema";

// ===== FOLDER QUERIES =====

// Get all folders for a specific user
export async function getFoldersByUserId(userId: string): Promise<Folder[]> {
  return await db
    .select()
    .from(folders)
    .where(eq(folders.userId, userId))
    .orderBy(desc(folders.isPinned), asc(folders.name));
}

// Create a new folder
export async function createFolder(data: Omit<NewFolder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folder> {
  const [newFolder] = await db
    .insert(folders)
    .values(data)
    .returning();
  
  return newFolder;
}

// Update a folder
export async function updateFolder(
  id: number, 
  userId: string, 
  data: Partial<Pick<NewFolder, 'name' | 'isPinned'>>
): Promise<Folder | null> {
  const [updatedFolder] = await db
    .update(folders)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(folders.id, id), eq(folders.userId, userId)))
    .returning();
  
  return updatedFolder || null;
}

// Delete a folder
export async function deleteFolder(id: number, userId: string): Promise<boolean> {
  // First, move all links from this folder to no folder
  await db
    .update(links)
    .set({ folderId: null, updatedAt: new Date() })
    .where(and(eq(links.folderId, id), eq(links.userId, userId)));
  
  // Then delete the folder
  const result = await db
    .delete(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, userId)));
  
  return result.rowsAffected > 0;
}

// Get a single folder by ID and user ID
export async function getFolderById(id: number, userId: string): Promise<Folder | null> {
  const [folder] = await db
    .select()
    .from(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, userId)))
    .limit(1);
  
  return folder || null;
}

// ===== LINK QUERIES =====

// Get all links for a specific user with optional search and folder filter
export async function getLinksByUserId(
  userId: string, 
  query?: string, 
  folderId?: number | null,
  sortBy: 'date' | 'alphabetical' | 'favorites' = 'date'
): Promise<Link[]> {
  try {
    let conditions = [eq(links.userId, userId)];
    
    if (query) {
      conditions.push(
        or(
          like(links.title, `%${query}%`),
          like(links.url, `%${query}%`),
          like(links.label, `%${query}%`)
        )!
      );
    }
    
    if (folderId !== undefined) {
      if (folderId === null) {
        conditions.push(isNull(links.folderId));
      } else {
        conditions.push(eq(links.folderId, folderId));
      }
    }

    let orderBy;
    switch (sortBy) {
      case 'alphabetical':
        orderBy = [asc(links.title)];
        break;
      case 'favorites':
        orderBy = [desc(links.isFavorite), desc(links.createdAt)];
        break;
      default:
        orderBy = [desc(links.createdAt)];
    }

    const queryBuilder = db
      .select()
      .from(links)
      .where(and(...conditions))
      .orderBy(...orderBy);

    return await queryBuilder;
  } catch (error) {
    console.error("Error fetching links:", error);
    return [];
  }
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
  data: Partial<Pick<NewLink, 'url' | 'title' | 'label' | 'folderId' | 'isFavorite'>>
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

// Toggle favorite status of a link
export async function toggleLinkFavorite(id: number, userId: string): Promise<Link | null> {
  const link = await getLinkById(id, userId);
  if (!link) return null;
  
  const [updatedLink] = await db
    .update(links)
    .set({ isFavorite: !link.isFavorite, updatedAt: new Date() })
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .returning();
  
  return updatedLink || null;
}

// Toggle pin status of a folder
export async function toggleFolderPin(id: number, userId: string): Promise<Folder | null> {
  const folder = await getFolderById(id, userId);
  if (!folder) return null;
  
  const [updatedFolder] = await db
    .update(folders)
    .set({ isPinned: !folder.isPinned, updatedAt: new Date() })
    .where(and(eq(folders.id, id), eq(folders.userId, userId)))
    .returning();
  
  return updatedFolder || null;
}