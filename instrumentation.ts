export async function register() {
    if (process.env.NEXT_RUNTIME === 'edge' || process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            await import('./lib/polyfill');
        } catch (e) {
            console.error('Failed to load polyfill:', e);
        }
    }
}
