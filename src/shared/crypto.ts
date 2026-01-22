/**
 * Utility functions for encryption/decryption using WebCrypto API
 */

import { ENCRYPTION_CONFIG } from './constants';

/**
 * Generate random salt for PBKDF2
 */
export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.SALT_LENGTH));
}

/**
 * Derive encryption key from password using PBKDF2
 */
export async function deriveKey(
    password: string,
    salt: Uint8Array,
    extractable: boolean = false
): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer as any,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    // Derive actual encryption key
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as any,
            iterations: ENCRYPTION_CONFIG.PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        {
            name: ENCRYPTION_CONFIG.ALGORITHM,
            length: ENCRYPTION_CONFIG.KEY_LENGTH * 8
        },
        extractable,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(
    data: Uint8Array,
    password: string,
    salt?: Uint8Array
): Promise<{ encrypted: string; salt: string; iv: string }> {
    const actualSalt = salt || generateSalt();
    const key = await deriveKey(password, actualSalt);
    const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.IV_LENGTH));

    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: ENCRYPTION_CONFIG.ALGORITHM,
            iv
        },
        key,
        data as any
    );

    return {
        encrypted: bufferToBase64(new Uint8Array(encryptedBuffer)),
        salt: bufferToBase64(actualSalt),
        iv: bufferToBase64(iv)
    };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(
    encryptedData: string,
    password: string,
    salt: string,
    iv: string
): Promise<Uint8Array> {
    const key = await deriveKey(password, base64ToBuffer(salt));

    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: ENCRYPTION_CONFIG.ALGORITHM,
            iv: base64ToBuffer(iv) as any
        },
        key,
        base64ToBuffer(encryptedData) as any
    );

    return new Uint8Array(decryptedBuffer);
}

/**
 * Convert Uint8Array to base64 string
 */
export function bufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        buffer[i] = binary.charCodeAt(i);
    }
    return buffer;
}

/**
 * Verify password by attempting decryption
 */
export async function verifyPassword(
    encryptedData: string,
    password: string,
    salt: string,
    iv: string
): Promise<boolean> {
    try {
        await decrypt(encryptedData, password, salt, iv);
        return true;
    } catch {
        return false;
    }
}

// --- KEY MANAGEMENT HELPERS (CRIT-002 FIX) ---

export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
    return crypto.subtle.exportKey('jwk', key);
}

export async function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'jwk',
        jwk,
        {
            name: ENCRYPTION_CONFIG.ALGORITHM,
            length: ENCRYPTION_CONFIG.KEY_LENGTH * 8
        },
        false, // Extractable
        ['encrypt', 'decrypt']
    );
}

export async function decryptWithKey(
    encryptedData: string,
    key: CryptoKey,
    iv: string
): Promise<Uint8Array> {
    const decryptedBuffer = await crypto.subtle.decrypt(
        {
            name: ENCRYPTION_CONFIG.ALGORITHM,
            iv: base64ToBuffer(iv) as any
        },
        key,
        base64ToBuffer(encryptedData) as any
    );

    return new Uint8Array(decryptedBuffer);
}
