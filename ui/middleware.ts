import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  if (isAuthPage) {
    if (token) {
      try {
        const payload = await verifyToken(token);
        if (payload) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch (error) {
        // Token is invalid, continue to auth page
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  } catch (error) {
    // Token is invalid, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/campaigns/:path*",
    "/login",
    "/register",
  ],
};
