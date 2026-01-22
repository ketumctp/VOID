
// SECURITY: Allowed message types (explicit allowlist)
export const ALLOWED_MESSAGE_TYPES = [
    'RIALO_WALLET_CONNECT',
    'RIALO_WALLET_DISCONNECT',
    'RIALO_WALLET_SIGN_TRANSACTION',
    'RIALO_WALLET_SIGN_MESSAGE',
    'RIALO_WALLET_SIGN_AND_SEND',
    'RIALO_WALLET_SEND_RAW_TRANSACTION',
] as const;

export type AllowedMessageType = typeof ALLOWED_MESSAGE_TYPES[number];

// SECURITY: Nonce tracking to prevent replay attacks
const usedNonces = new Set<string>();
const MAX_NONCE_SIZE = 1000;

export function validateMessage(data: any): { valid: boolean; error?: string; silent?: boolean } {
    // Check message type is in allowlist
    if (!data.type || !ALLOWED_MESSAGE_TYPES.includes(data.type)) {
        return { valid: false, error: 'Invalid message type', silent: true };
    }

    // Check required fields
    if (!data.id || typeof data.id !== 'string') {
        return { valid: false, error: 'Missing or invalid message ID' };
    }

    // SECURITY: Nonce validation
    if (usedNonces.has(data.id)) {
        return { valid: false, error: 'Replay attack detected' };
    }

    // Check for silent bypass attempts (FORBIDDEN)
    if (data.silent === true) {
        console.warn('[Rialo Security] Attempted silent bypass blocked');
    }

    return { valid: true };
}

export function trackNonce(id: string): void {
    usedNonces.add(id);
    if (usedNonces.size > MAX_NONCE_SIZE) {
        const iterator = usedNonces.values();
        const first = iterator.next();
        if (!first.done && first.value) {
            usedNonces.delete(first.value);
        }
    }
}
