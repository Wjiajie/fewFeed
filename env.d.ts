
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DB: D1Database;
            BUCKET: R2Bucket;
            AI: any;
            QUEUE: any;
        }
    }
}
