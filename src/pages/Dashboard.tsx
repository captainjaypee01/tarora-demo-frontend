import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDevices, fetchTelemetry, fetchEvents, type Telemetry, type EventItem } from '@/lib/api'
import { telemetrySocket } from '../lib/ws'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select"
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../components/ui/table'
import { KPI } from '../components/kpi'
import { TelemetryChart } from '../components/telemetry-chart'
import { CommandPanel } from '../components/command-panel'
import { type WSMessage, type WSEvent, type WSStatus, type WSTelemetry } from "@/types/ws";
import { StatusPill } from "@/components/status-pill";
import { EventFeed } from "@/components/event-feed";
import { DeviceEventsTable } from "@/components/device-events-table";
import { TelemetryTable } from "@/components/device-telemetry-table";

export default function Dashboard() {
    const qc = useQueryClient()
    const { data: devices = [], isLoading: isLoadingDevices } = useQuery({ queryKey: ['devices'], queryFn: fetchDevices })
    const [selected, setSelected] = useState<string | null>(null)
    const { data: series = [], isLoading: isLoadingSeries } = useQuery({
        queryKey: ['telemetry', selected],
        queryFn: () => fetchTelemetry(selected!),
        enabled: !!selected,
    })

    const { data: deviceEvents = [] } = useQuery({
        queryKey: ['events', selected],
        queryFn: () => fetchEvents(selected!, 200),
        enabled: !!selected,
    })

    const [statusByDevice, setStatusByDevice] = useState<Record<string, WSStatus["status"]>>({});
    const [events, setEvents] = useState<WSEvent[]>([]);
    const telemetryBuffer = useRef<Record<string, WSTelemetry[]>>({}); // for charts

    useEffect(() => {
        const ws = telemetrySocket((msg) => {
            if (msg.kind === "status") {
                setStatusByDevice((m) => ({ ...m, [msg.device_id]: msg.status }));
            } else if (msg.kind === "event") {
                setEvents((arr) => {
                    const next = arr.length > 200 ? arr.slice(arr.length - 200) : arr;
                    return [...next, msg];
                });
                // live-update device events cache
                qc.setQueryData<EventItem[] | undefined>(['events', msg.device_id], (prev) => {
                    const row: EventItem = {
                        id: Date.now(), // UI key only; DB id comes from HTTP fetch
                        device_id: msg.device_id,
                        ts: msg.ts,
                        level: msg.level ?? "info",
                        event: msg.event,
                        details: msg.details,
                        name: msg.name,
                    };
                    const arr = prev ? [...prev, row] : [row];
                    return arr.length > 200 ? arr.slice(arr.length - 200) : arr;
                });
                // optional: toast on alarms
                // if (msg.level === "alarm") toast.error(`${msg.device_id}: ${msg.event}`);
            } else if (msg.kind === "telemetry") {
                const dev = msg.device_id;
                const buf = telemetryBuffer.current[dev] ?? [];
                buf.push(msg);
                if (buf.length > 500) buf.shift();
                telemetryBuffer.current[dev] = buf;
                // live-update telemetry cache for that device
                qc.setQueryData<Telemetry[] | undefined>(['telemetry', dev], (prev) => {
                    const row: Telemetry = { device_id: dev, ts: msg.ts, data: (msg.data as Record<string, any>) ?? {} };
                    const arr = prev ? [...prev, row] : [row];
                    return arr.length > 500 ? arr.slice(arr.length - 500) : arr;
                });
            }
        })
        return () => ws.close()
    }, [qc])

    useEffect(() => { if (devices.length && !selected) setSelected(devices[0].id) }, [devices, selected])

    const latest = series?.[series.length - 1]
    const metricKeys = latest ? Object.keys(latest.data) : []
    return (
        <div className="max-w-8xl mx-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <KPI label="Devices" value={isLoadingDevices ? '—' : devices.length} />
                <KPI label="Selected" value={selected || '—'} />
                <KPI label="Latest TS" value={latest ? new Date(latest.ts).toLocaleTimeString() : '—'} />
                <KPI label="Metrics" value={metricKeys.length || '—'} />
            </div>

            {/* Global live Events feed (all devices) */}
            <div className="col-span-1">
                <EventFeed events={events} />
            </div>
            <Card>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">Devices</CardTitle>
                    <div className="w-60">
                        <Select value={selected ?? ''} onValueChange={(v) => setSelected(v || null)}>
                            <SelectTrigger aria-label="Select device">
                                <SelectValue placeholder={isLoadingDevices ? "Loading devices..." : "Select a device"} />
                            </SelectTrigger>
                            <SelectContent>
                                {devices.length === 0 && !isLoadingDevices ? (
                                    <SelectItem disabled value="empty">No devices</SelectItem>
                                ) : (
                                    devices.map((d) => (
                                        <SelectItem key={d.id} value={d.id ?? ""}>
                                            {d.name} ({d.type})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingSeries ? (
                        <div className="text-muted-foreground text-sm">Loading telemetry…</div>
                    ) : selected && metricKeys.length > 0 ? (
                        <TelemetryChart data={series} keys={metricKeys} />
                    ) : (
                        <div className="text-muted-foreground text-sm">Select a device to see charts.</div>
                    )}
                </CardContent>
            </Card>

            {selected && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Quick Commands</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CommandPanel deviceId={selected} />
                    </CardContent>
                </Card>
            )}


            {/* Two-column section (stacks to 1 col on mobile): Device Events  Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DeviceEventsTable rows={deviceEvents} />
                <TelemetryTable rows={series} />
            </div>
        </div>
    )
}