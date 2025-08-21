import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc';
import { load } from 'cheerio';

export const utilsRouter = createTRPCRouter({
  // Fetch title from URL
  fetchTitle: publicProcedure
    .input(
      z.object({
        url: z.string().url('Invalid URL format'),
      })
    )
    .mutation(async ({ input }) => {
      const { url } = input;

      // Only allow HTTP and HTTPS protocols
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('Only HTTP and HTTPS URLs are allowed');
      }

      try {
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
          throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
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

        return { 
          title,
          url,
          success: true 
        };

      } catch (error) {
        console.error('Error fetching title:', error);
        
        // Handle specific error types
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Request timeout - the page took too long to load');
          }
          
          if (error.message.includes('fetch')) {
            throw new Error('Failed to fetch the page - it may be unreachable or blocked');
          }
          
          // Re-throw the error message if it's already descriptive
          throw new Error(error.message);
        }

        throw new Error('Internal server error while fetching title');
      }
    }),
});
