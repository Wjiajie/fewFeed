// @ts-nocheck
if (typeof globalThis.setImmediate === 'undefined') {
    globalThis.setImmediate = ((fn: any, ...args: any[]) => setTimeout(fn, 0, ...args)) as any;
}
