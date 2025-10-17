import NextAuth from "next-auth";
import {
    publicRoutes,
    protectedRoutes,
    apiAuthPrefix,
    DEFAULT_LOGIN_REDIRECT,
    authRoutes
} from '@/routes'
import authConfig from "./auth.config";

const {auth} = NextAuth(authConfig)
export default auth((req)=>{
    const {nextUrl}=req
    const isLoggedIn=!!req.auth

    const isApiRoutes=nextUrl.pathname.startsWith(apiAuthPrefix)
    const isPublicRoute=publicRoutes.includes(nextUrl.pathname)
    const isAuthRoutes=authRoutes.includes(nextUrl.pathname)
    if (isApiRoutes) {
        return null;
      }
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

if (isDashboardRoute) {

  if (req.auth?.user?.email !== process.env.ADMIN_EMAIL) {
    return Response.redirect(new URL("/", nextUrl));
  }
}

      if (isAuthRoutes) {
        if (isLoggedIn) {
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return null;
      }
    
      if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/auth/sign-in", nextUrl));
      }
    
      return null;
});
    
    export const config = {
      // copied from clerk
      matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

