// Preview socket disabled; provide minimal stubs to prevent type errors.

export interface MockSocketEvent {
    type: string;
    data: any;
    timestamp: string;
}

export interface MockSocketListener {
    event: string;
    callback: (data: any) => void;
}

export class PreviewSocketService {
    static getInstance(): PreviewSocketService {
        return new PreviewSocketService();
    }

    connect(): Promise<void> {
        return Promise.resolve();
    }

    disconnect(): void {}

    isConnectedToServer(): boolean { return false; }

    on(_event: string, _callback: (data: any) => void): void {}
    off(_event: string, _callback?: (data: any) => void): void {}
    send(_event: string, _data: any): void {}

    private startPeriodicEvents(): void {
        // no-op
    }
}

export const previewSocket: any = null;
export default previewSocket;
