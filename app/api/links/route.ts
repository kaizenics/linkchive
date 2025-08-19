import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getLinksByUserId, createLink } from '@/db/queries';

// GET /api/links - Get all links for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const folderIdParam = searchParams.get('folderId');
    const sortBy = searchParams.get('sortBy') as 'date' | 'alphabetical' | 'favorites' || 'date';

    let folderId: number | null | undefined = undefined;
    if (folderIdParam !== null) {
      if (folderIdParam === 'null') {
        folderId = null; // No folder (root level)
      } else {
        const parsedFolderId = parseInt(folderIdParam);
        if (!isNaN(parsedFolderId)) {
          folderId = parsedFolderId;
        }
      }
    }

    const links = await getLinksByUserId(userId, query || undefined, folderId, sortBy);

    return NextResponse.json({ 
      success: true, 
      links 
    });

  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, title, label, folderId } = body;

    // Validate required fields
    if (!url || !title || !label) {
      return NextResponse.json(
        { error: 'URL, title, and label are required' },
        { status: 400 }
      );
    }

    // Ensure URL has protocol
    const fullUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;

    // Create the link
    const newLink = await createLink({
      url: fullUrl,
      title,
      label,
      userId,
      folderId: folderId || null,
      isFavorite: false,
    });

    return NextResponse.json({ 
      success: true, 
      link: newLink 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}