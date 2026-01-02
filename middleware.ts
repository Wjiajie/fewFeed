import NextAuth from "next-auth"
import { authConfig } from "./lib/auth.config"
import { getCloudflareContext } from "@opennextjs/cloudflare"

export default async function middleware(req: any) {
    // Use getCloudflareContext to get runtime env vars
    let secret = process.env.AUTH_SECRET;
    try {
        const { env } = await getCloudflareContext();
        // @ts-ignore
        if (env.AUTH_SECRET) {
            // @ts-ignore
            secret = env.AUTH_SECRET;
        }
    } catch (e) {
        console.warn("Failed to get Cloudflare context:", e);
    }

    // Check if we have the secret now
    console.log('🛡️ Mware env check:', {
        hasSecret: !!secret,
        secretLen: secret?.length
    });

    // Manually invoke NextAuth with the injected secret
    const config = {
        ...authConfig,
        secret: secret || process.env.AUTH_SECRET // Fallback
    };

    return NextAuth(config).auth(req);
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
}
