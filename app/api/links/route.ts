import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getLinksByUserId, createLink, searchLinks } from '@/db/queries';

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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let links;
    if (query) {
      // Search links if query parameter is provided
      links = await searchLinks(userId, query);
    } else {
      // Get all links for the user
      links = await getLinksByUserId(userId);
    }

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
    const { url, title, label } = body;

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
