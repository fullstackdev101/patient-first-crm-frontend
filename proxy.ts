import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register'];

// Define protected routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/leads',
    '/users',
    '/activities',
    '/settings'
];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Remove trailing slash if present (except for root)
    if (pathname !== '/' && pathname.endsWith('/')) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.slice(0, -1);
        return NextResponse.redirect(url, 308); // Permanent redirect
    }

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Get auth token from cookies or check for auth-storage in the request
    // Note: Since we're using localStorage, we can't directly access it in middleware
    // We'll rely on the ProtectedRoute component for the actual auth check
    // This middleware serves as an additional layer

    // If trying to access a protected route
    if (isProtectedRoute) {
        // The actual auth check happens in the ProtectedRoute component
        // This middleware just ensures the structure is in place
        return NextResponse.next();
    }

    // If trying to access login while potentially authenticated
    if (pathname === '/login') {
        // Let the login page handle its own logic
        return NextResponse.next();
    }

    // For root path, allow it through (ProtectedRoute will handle auth)
    if (pathname === '/') {
        return NextResponse.next();
    }

    return NextResponse.next();
}

// Configure which routes should trigger the middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
