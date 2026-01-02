import "@/lib/polyfill";
import { handlers } from "@/lib/auth"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextRequest } from "next/server";

async function injectEnv() {
    const { env } = await getCloudflareContext();
    console.log("🔍 [Route] Cloudflare Context Env Keys:", env ? Object.keys(env) : "null");

    if (env) {
        if (env.AUTH_SECRET) process.env.AUTH_SECRET = env.AUTH_SECRET;
        if (env.AUTH_GITHUB_ID) process.env.AUTH_GITHUB_ID = env.AUTH_GITHUB_ID;
        if (env.AUTH_GITHUB_SECRET) process.env.AUTH_GITHUB_SECRET = env.AUTH_GITHUB_SECRET;
        if (env.AUTH_GOOGLE_ID) process.env.AUTH_GOOGLE_ID = env.AUTH_GOOGLE_ID;
        if (env.AUTH_GOOGLE_SECRET) process.env.AUTH_GOOGLE_SECRET = env.AUTH_GOOGLE_SECRET;

        // Inject AUTH_URL and TRUST_HOST
        if (env.AUTH_URL) process.env.AUTH_URL = env.AUTH_URL;
        if (env.AUTH_TRUST_HOST) process.env.AUTH_TRUST_HOST = env.AUTH_TRUST_HOST;

        console.log("✅ [Route] Injected Vars:", {
            AUTH_SECRET_LEN: process.env.AUTH_SECRET?.length,
            AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
            AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
            AUTH_URL: process.env.AUTH_URL,
            TRUST_HOST: process.env.AUTH_TRUST_HOST
        });

        // Inject DB for Adapter if needed
        if (env.DB && !(process.env as any).DB) (process.env as any).DB = env.DB;
    } else {
        console.warn("⚠️ [Route] Failed to get env from context");
    }
}

export const GET = async (req: NextRequest) => {
    await injectEnv();
    return handlers.GET(req);
}

export const POST = async (req: NextRequest) => {
    await injectEnv();
    return handlers.POST(req);
}
