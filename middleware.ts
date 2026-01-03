import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
    // Middleware for Better-Auth access control.
    // For now, allowing all requests to proceed.
    // Implement specific route protection here or via layout checks.
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
}
