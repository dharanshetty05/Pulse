import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/companies", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};


// import { NextResponse, type NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Allow auth API routes, login, and register
//   if (
//     pathname.startsWith("/api/auth") ||
//     pathname.startsWith("/api/debug-db") ||
//     pathname === "/login" ||
//     pathname === "/register"
//   ) {
//     return NextResponse.next();
//   }

//   try {
//     const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
//       headers: request.headers,
//     });

//     if (!response.ok) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }

//     const session = await response.json();

//     // better-auth returns a session object with { session, user }
//     if (!session || !session.session) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   } catch (error) {
//     // If we can't connect, default to redirecting to login to be safe
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   if (pathname === "/") {
//     return NextResponse.redirect(new URL("/companies", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico, sitemap.xml, robots.txt (metadata files)
//      */
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };
