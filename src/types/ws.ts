export type BaseWS = {
    device_id: string;
    type: string;
    ts: string;
    name?: string;
};

export type WSTelemetry = BaseWS & {
    kind: "telemetry";
    device_id: string;
    type: string;
    ts: string;
    data: Record<string, unknown>;
};

export type WSStatus = BaseWS & {
    kind: "status";
    device_id: string;
    type: string;
    ts: string;
    status: "online" | "offline" | "unknown";
};

export type WSEvent = BaseWS & {
    kind: "event";
    device_id: string;
    type: string;
    ts: string;
    event: string;
    level?: "info" | "alarm" | "warn" | "error";
    details?: Record<string, unknown>;
};

export type WSMessage = WSTelemetry | WSStatus | WSEvent;
