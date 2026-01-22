export interface PendingRequest {
    id: string;
    type: string;
    origin?: string;
    data: any;
    parsed?: any;
    resolve?: (value: any) => void;
    reject?: (reason?: any) => void;
    tabId?: number;
}
