import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Get the token from the Authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (token) {
    try {
      // Verify the token and get the user
      const user = await verifyToken(token);

      // Add the user to the request headers
      res.headers.set("x-user-id", user.id);
      res.headers.set("x-user-address", user.walletAddress);
    } catch (error) {
      console.error("Auth error:", error);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/auth (auth endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
};
