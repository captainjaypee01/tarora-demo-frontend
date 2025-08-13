export type WSTelemetry = {
    kind: "telemetry";
    device_id: string;
    type: string;
    ts: string;
    data: Record<string, unknown>;
};

export type WSStatus = {
    kind: "status";
    device_id: string;
    type: string;
    ts: string;
    status: "online" | "offline" | "unknown";
};

export type WSEvent = {
    kind: "event";
    device_id: string;
    type: string;
    ts: string;
    event: string;
    level?: "info" | "alarm" | "warn" | "error";
    details?: Record<string, unknown>;
};

export type WSMessage = WSTelemetry | WSStatus | WSEvent;
