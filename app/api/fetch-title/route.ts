import { NextRequest, NextResponse } from 'next/server';
import { load } from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow HTTP and HTTPS protocols
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    // Fetch the page with proper headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      // Set a timeout
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Use cheerio to parse HTML and extract title
    const $ = load(html);
    
    // Try multiple selectors for title
    let title = $('title').first().text().trim();
    
    // Fallback to meta tags if no title found
    if (!title) {
      title = $('meta[property="og:title"]').attr('content') || '';
    }
    
    if (!title) {
      title = $('meta[name="twitter:title"]').attr('content') || '';
    }
    
    if (!title) {
      title = $('h1').first().text().trim();
    }

    // Clean up the title
    if (title) {
      // Remove extra whitespace and newlines
      title = title.replace(/\s+/g, ' ').trim();
      // Limit title length
      if (title.length > 200) {
        title = title.substring(0, 200) + '...';
      }
    }

    // If still no title, create one from the URL
    if (!title) {
      try {
        const urlObj = new URL(url);
        title = urlObj.hostname.replace('www.', '');
        if (urlObj.pathname !== '/') {
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            title += ' - ' + pathParts.join(' ');
          }
        }
      } catch {
        title = 'Untitled Link';
      }
    }

    return NextResponse.json({ 
      title,
      url,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching title:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - the page took too long to load' },
          { status: 408 }
        );
      }
      
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Failed to fetch the page - it may be unreachable or blocked' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error while fetching title' },
      { status: 500 }
    );
  }
}
