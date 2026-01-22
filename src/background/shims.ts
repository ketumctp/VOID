
// SHIM: Ensure global and Buffer exist for dependencies
import { Buffer } from 'buffer';

if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer;
}
if (typeof (globalThis as any).global === 'undefined') {
    (globalThis as any).global = globalThis;
}
if (typeof (globalThis as any).window === 'undefined') {
    (globalThis as any).window = globalThis;
}
// SHIM: document for @solana/web3.js
if (typeof (globalThis as any).document === 'undefined') {
    (globalThis as any).document = {
        referrer: '',
        createElement: () => ({}),
        location: { href: '' },
        getElementsByTagName: () => [], // Return empty array-like
        querySelector: () => null,
        querySelectorAll: () => [],
        head: { appendChild: () => { } },
        body: { appendChild: () => { } }
    };
}

console.log('[Rialo] Shims applied. Buffer:', !!globalThis.Buffer, 'Global:', !!(globalThis as any).global);
