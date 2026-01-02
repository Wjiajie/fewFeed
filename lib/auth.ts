import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { D1Adapter } from "@auth/d1-adapter"

import { getCloudflareContext } from "@opennextjs/cloudflare"

// Debugging env vars in production
console.log("🔍 Checking Env Vars (Pre-Init):", {
  NODE_ENV: process.env.NODE_ENV,
  AUTH_SECRET_LEN: process.env.AUTH_SECRET?.length,
});

// Attempt to populate process.env from Cloudflare context if missing
// This uses top-level await which is supported in Next.js App Router
try {
  const { env } = await getCloudflareContext();
  if (env && env.AUTH_SECRET) {
    process.env.AUTH_SECRET = env.AUTH_SECRET;
    console.log("✅ Injected AUTH_SECRET from Cloudflare Context");
  }
  // Inject DB if missing (for API routes)
  if (env && env.DB && !(process.env as any).DB) {
    (process.env as any).DB = env.DB;
    console.log("✅ Injected DB from Cloudflare Context");
  }
} catch (e) {
  // Ignore error in dev/build phase where getCloudflareContext might fail
  // console.warn("Notice: getCloudflareContext failed (normal during build):", e);
}

// In development or if context failed, usage standard process.env or loading
export let db = (process.env as any).DB;

// If db is missing OR it's been mangled into a string "[object Object]" by Next.js env handling
if (process.env.NODE_ENV === "development" && (!db || typeof db === 'string')) {
  try {
    const { getPlatformProxy } = require("wrangler");
    // We use a synchronous-looking pattern with top-level await if possible, 
    // or lazy-load it. For Auth.js adapter, we need the DB ready.
    // However, top-level await is supported in Next.js Server Components/ESM.
    console.log("🔄 Initializing Cloudflare Proxy in lib/auth.ts...");
    // @ts-ignore
    const { env } = await getPlatformProxy({ persist: true });
    db = env.DB;
    console.log("✅ Cloudflare Proxy initialized. D1 is ready.");
  } catch (e) {
    console.error("❌ Failed to init Cloudflare Proxy:", e);
  }
}

if (!db) {
  console.warn("⚠️ D1 Database binding (DB) not found. Using mock implementation.")
} else {
  console.log("✅ D1 Database binding found.")
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: D1Adapter(db || {
    prepare: (query: string) => {
      console.log("Mock DB prepare called with:", query);
      return {
        bind: (...args: any[]) => ({
          all: async () => { console.log("Mock DB all"); return [] },
          run: async () => { console.log("Mock DB run"); return { success: true } },
          first: async () => { console.log("Mock DB first"); return null }
        })
      }
    }
  } as any),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    // @ts-ignore
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: "jwt" }, // Use JWT for edge compatibility and performance
  trustHost: true, // Explicitly trust the host for Cloudflare Workers
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login', // Custom login page
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
})
