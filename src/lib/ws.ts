import { type WSMessage } from "@/types/ws";
import { useStatusStore } from "@/store/status";

let socket: WebSocket | null = null;

export function telemetrySocket(onMessage: (msg: any) => void) {
    const url = import.meta.env.VITE_WS_URL as string;
    if (socket && socket.readyState === WebSocket.OPEN) return socket;

    socket = new WebSocket(url);

    socket.onopen = () => console.info("[WS] connected:", url);
    socket.onclose = () => console.info("[WS] disconnected");
    socket.onerror = (e) => console.warn("[WS] error", e);

    socket.onmessage = (ev) => {
        try {
            const raw = JSON.parse(ev.data);
            // backward-compat: default to telemetry if API ever omitted kind
            const kind = raw.kind ?? (raw.data ? "telemetry" : "status");
            const msg = { ...raw, kind } as WSMessage;
            if (msg.kind === "status") {
                useStatusStore.getState().setStatus(msg.device_id, msg.status);
            }
            onMessage(msg);
        } catch (_e) {
            /* ignore bad frames */
        }
    };

    return socket;
}