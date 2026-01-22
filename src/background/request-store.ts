/**
 * Request Store - Persist pending requests across Service Worker restarts
 */

const STORAGE_KEY = 'rialo_pending_requests';

// Defines the serializable part of a PendingRequest (no functions)
export interface SerializedRequest {
    id: string;
    type: string;
    origin?: string;
    data: any;
    parsed?: any;
    timestamp: number;
    tabId?: number;
}

export async function saveRequest(request: SerializedRequest): Promise<void> {
    const store = await getAllRequests();
    store[request.id] = request;
    await chrome.storage.session.set({ [STORAGE_KEY]: store });
}

export async function getRequest(id: string): Promise<SerializedRequest | null> {
    const store = await getAllRequests();
    return store[id] || null;
}

export async function removeRequest(id: string): Promise<void> {
    const store = await getAllRequests();
    if (store[id]) {
        delete store[id];
        await chrome.storage.session.set({ [STORAGE_KEY]: store });
    }
}

export async function getAllRequests(): Promise<Record<string, SerializedRequest>> {
    const result = await chrome.storage.session.get(STORAGE_KEY);
    return (result[STORAGE_KEY] || {}) as Record<string, SerializedRequest>;
}

// --- DUPLICATE/REPLAY PROTECTION (CRIT-007) ---
const PROCESSED_KEY = 'rialo_processed_ids';
const MAX_PROCESSED_HISTORY = 5000; // Increased from 1000 to mitigate eviction flooding

export async function addProcessedId(id: string): Promise<void> {
    const ids = await getProcessedIds();
    // Add to front, limit size
    if (ids.includes(id)) return;

    ids.unshift(id);
    if (ids.length > MAX_PROCESSED_HISTORY) {
        ids.length = MAX_PROCESSED_HISTORY;
    }

    await chrome.storage.session.set({ [PROCESSED_KEY]: ids });
}

export async function isIdProcessed(id: string): Promise<boolean> {
    const ids = await getProcessedIds();
    return ids.includes(id);
}

async function getProcessedIds(): Promise<string[]> {
    const result = await chrome.storage.session.get(PROCESSED_KEY);
    return (result[PROCESSED_KEY] || []) as string[];
}
