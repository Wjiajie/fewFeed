import type { NextConfig } from "next";

const nextConfig = async (): Promise<NextConfig> => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const { getPlatformProxy } = await import("wrangler");
      const { env } = await getPlatformProxy({
        persist: true,
      });

      // Inject bindings into global scope for local development
      // process.env stringifies values, so we use globalThis to persist the D1 object
      if (env.DB) (globalThis as any).DB = env.DB;
      if (env.BUCKET) (globalThis as any).BUCKET = env.BUCKET;
      if (env.AI) (globalThis as any).AI = env.AI;
      if (env.QUEUE) (globalThis as any).QUEUE = env.QUEUE;
    } catch (error) {
      console.error("⚠️ Cloudflare Proxy Error: Failed to load bindings.", error);
      console.warn("⚠️ Running in degraded mode. DB/Auth will not work until you register a Workers subdomain.");
    }
  }

  return {
    serverExternalPackages: ["wrangler"],
    /* config options here */
  };
};

export default nextConfig;
