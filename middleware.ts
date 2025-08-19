import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/links(.*)', // Protect the links page and all sub-routes
  '/dashboard(.*)', // Protect any future dashboard routes
])

export default clerkMiddleware(async (auth, req) => {
  // Check if user is trying to access a protected route
  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    
    // If user is not authenticated, redirect to home with auth message
    if (!userId) {
      const homeUrl = new URL('/', req.url)
      homeUrl.searchParams.set('auth', 'required')
      return NextResponse.redirect(homeUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}