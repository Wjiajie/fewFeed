// @ts-nocheck
try {
    // 尝试删除可能存在的只读 setImmediate，以便 Next.js 或我们可以重新定义它
    if (globalThis.setImmediate) {
        try {
            Reflect.deleteProperty(globalThis, 'setImmediate');
        } catch (e) {
            // ignore
        }
    }

    if (typeof globalThis.setImmediate === 'undefined') {
        Reflect.defineProperty(globalThis, 'setImmediate', {
            value: (fn: any, ...args: any[]) => setTimeout(fn, 0, ...args),
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
} catch (e) {
    console.warn('[Polyfill] Failed to patch setImmediate:', e);
}
