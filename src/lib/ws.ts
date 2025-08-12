export function telemetrySocket(onMessage: (msg: any) => void) {
    const url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/telemetry'
    const ws = new WebSocket(url)
    ws.onmessage = (ev) => {
        try { onMessage(JSON.parse(ev.data)) } catch { }
    }
    return ws
}