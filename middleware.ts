import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req:NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // Allow requests to public routes
  if (pathname.startsWith("/api/auth") || pathname === "/signin" || pathname === "/") {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to the sign-in page
  if (!token) {
    const signinUrl = new URL("/signin", req.url);
    return NextResponse.redirect(signinUrl);
  }

  // Allow authenticated users to continue
  return NextResponse.next();
}

export const config = {
  // Specify routes to apply middleware (protected routes)
  matcher: ["/protected/:path*", "/dashboard/:path*", "/" ],
};