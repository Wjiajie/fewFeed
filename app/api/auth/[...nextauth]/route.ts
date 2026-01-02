import "@/lib/polyfill";
import { handlers } from "@/lib/auth"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { NextRequest } from "next/server";

async function injectEnv() {
    const { env } = await getCloudflareContext();
    if (env) {
        if (env.AUTH_SECRET) process.env.AUTH_SECRET = env.AUTH_SECRET;
        if (env.AUTH_GITHUB_ID) process.env.AUTH_GITHUB_ID = env.AUTH_GITHUB_ID;
        if (env.AUTH_GITHUB_SECRET) process.env.AUTH_GITHUB_SECRET = env.AUTH_GITHUB_SECRET;
        if (env.AUTH_GOOGLE_ID) process.env.AUTH_GOOGLE_ID = env.AUTH_GOOGLE_ID;
        if (env.AUTH_GOOGLE_SECRET) process.env.AUTH_GOOGLE_SECRET = env.AUTH_GOOGLE_SECRET;
        // Inject DB for Adapter if needed
        if (env.DB && !(process.env as any).DB) (process.env as any).DB = env.DB;
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
