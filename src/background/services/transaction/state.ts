import type { PendingRequest } from './types';

// In-memory map for active sessions
export const pendingRequests = new Map<string, PendingRequest>();

export const state = {
    getPendingRequest: (id: string) => pendingRequests.get(id),
    setPendingRequest: (id: string, req: PendingRequest) => pendingRequests.set(id, req),
    deletePendingRequest: (id: string) => pendingRequests.delete(id),
    hasPendingRequest: (id: string) => pendingRequests.has(id),
    getAllPendingRequests: () => pendingRequests
};
