import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        const backendUrl =
            process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
            'http://localhost:5001';

        socket = io(backendUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            timeout: 10000,
            autoConnect: true,
        });

        socket.on('connect', () => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('[Socket] Connected:', socket?.id);
            }
        });

        socket.on('connect_error', (err) => {
            if (process.env.NODE_ENV !== 'production') {
                console.warn('[Socket] Connection error:', err.message);
            }
        });

        socket.on('reconnect', (attempt) => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('[Socket] Reconnected after', attempt, 'attempts');
            }
        });

        socket.on('reconnect_failed', () => {
            console.error('[Socket] Failed to reconnect after max attempts. Real-time updates unavailable.');
        });
    }
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
