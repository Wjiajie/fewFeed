// @ts-nocheck
try {
    if (typeof globalThis.setImmediate === 'undefined') {
        // Use Reflect.defineProperty to handle cases where the property might be read-only but configurable
        Reflect.defineProperty(globalThis, 'setImmediate', {
            value: (fn: any, ...args: any[]) => setTimeout(fn, 0, ...args),
            writable: true,
            configurable: true
        });
    }
} catch (e) {
    console.warn('[Polyfill] Failed to define setImmediate:', e);
}
