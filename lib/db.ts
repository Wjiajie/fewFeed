import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Helper to get the DB binding in various environments
const getDb = async () => {
    // 1. Local Development (set by next.config.ts proxy)
    if ((globalThis as any).DB) return (globalThis as any).DB;

    // 2. Production / Edge Runtime
    try {
        const { env } = await getCloudflareContext();
        if (env?.DB) return env.DB;
    } catch (e) {
        // Ignored during build or non-edge execution
    }

    // 3. Last resort
    return (process.env as any).DB;
}

// Ensure binding is present before initializing
const d1 = await getDb();

export const db = drizzle(d1);
