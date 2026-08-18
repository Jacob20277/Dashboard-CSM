import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isAdminRoute = pathname.startsWith("/admin");

      if (!isLoggedIn) return false;

      if (isAdminRoute && auth.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
