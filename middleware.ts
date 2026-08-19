import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/log/:path*",
    "/admin/:path*",
    "/change-password/:path*",
    "/csat-links/:path*",
  ],
};
