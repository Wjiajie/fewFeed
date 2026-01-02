import NextAuth from "next-auth"
import { authConfig } from "./lib/auth.config"

// Debug in middleware
console.log('🛡️ Mware env check:', {
    hasSecret: !!process.env.AUTH_SECRET,
    secretLen: process.env.AUTH_SECRET?.length
});

const { auth } = NextAuth(authConfig)
export default auth

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
}
