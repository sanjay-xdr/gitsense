// import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./app/auth";


export async function middleware(req:NextRequest) {
    const session:any = await auth()
console.log(session ," session from the middleware")
  const { pathname } = req.nextUrl;

  // Allow requests to public routes
  if (pathname.startsWith("/api/auth") || pathname === "/signin" || pathname === "/") {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to the sign-in pageS
  if (!session || !session.accessToken) {
    console.log("Redirecting here");
    const signinUrl = new URL("/signin", req.url);
    return NextResponse.redirect(signinUrl);
  }

  // Allow authenticated users to continue
  return NextResponse.next();
}

export const config = {
  // Specify routes to apply middleware (protected routes)
  matcher: ["/protected/:path*", "/repos/:path*"],
};