import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import authSeller from "./lib/authSeller";

const isSellerRoute = createRouteMatcher(["/seller(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isSellerRoute(request)) {
    const authResponse = await auth();

    if (!authResponse.userId) {
      return authResponse.redirectToSignIn({ returnBackUrl: request.url });
    }

    const isSeller = await authSeller(authResponse.userId);

    if (!isSeller) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/seller(.*)',
  ],
};