import { useState, useEffect, useRef, useMemo } from 'react'
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
import { KPI } from '../components/kpi'
import { TelemetryChart } from '../components/telemetry-chart'
import { CommandPanel } from '../components/command-panel'
import { type WSMessage, type WSEvent, type WSStatus, type WSTelemetry } from "@/types/ws";
import { EventFeed } from "@/components/event-feed";
import { DeviceEventsTable } from "@/components/device-events-table";
import { TelemetryTable } from "@/components/device-telemetry-table";
import { summarizeDoor } from '@/lib/utils'

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

    const prependCapped = <T,>(prev: T[] | undefined, item: T, cap: number) => {
        const base = prev ?? [];
        if (base.length && "ts" in base[0] && "ts" in (item as any)) {
            // avoid duplicates when the same row comes from HTTP + WS
            const exists = base.some((r: any) => r.ts === (item as any).ts);
            if (exists) return base;
        }
        const next = [item, ...base];
        return next.length > cap ? next.slice(0, cap) : next;
    };

    const [statusByDevice, setStatusByDevice] = useState<Record<string, WSStatus["status"]>>({});
    const [events, setEvents] = useState<WSEvent[]>([]);
    const telemetryBuffer = useRef<Record<string, WSTelemetry[]>>({}); // for charts


    // A device is a “door” if any telemetry point has a boolean `open` key
    const isDoorDevice = useMemo(
        () => series.some((r) => typeof r.data?.open === 'boolean'),
        [series]
    );
    useEffect(() => {
        const ws = telemetrySocket((msg) => {
            if (msg.kind === "status") {
                setStatusByDevice((m) => ({ ...m, [msg.device_id]: msg.status }));
            } else if (msg.kind === "event") {
                // global feed (append)
                setEvents((arr) => {
                    const next = [...arr, msg];
                    return next.length > 200 ? next.slice(next.length - 200) : next;
                });
                // device table (prepend)
                qc.setQueryData<EventItem[] | undefined>(['events', msg.device_id], (prev) => {
                    const row: EventItem = {
                        id: Date.now(), device_id: msg.device_id, ts: msg.ts,
                        level: msg.level ?? "info", event: msg.event, details: msg.details, name: msg.name,
                    };
                    return prependCapped(prev, row, 200);
                });
            } else if (msg.kind === "telemetry") {
                const dev = msg.device_id;
                // device telemetry table (prepend)
                qc.setQueryData<Telemetry[] | undefined>(['telemetry', dev], (prev) => {
                    const row: Telemetry = { device_id: dev, ts: msg.ts, data: (msg.data as Record<string, any>) ?? {} };
                    return prependCapped(prev, row, 500);
                });
            }
        });
        return () => ws.close();
    }, [qc]);

    useEffect(() => { if (devices.length && !selected) setSelected(devices[0].id) }, [devices, selected])
    const seriesAsc = useMemo(
        () => [...series].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()),
        [series]
    );
    const latest = series?.[series.length - 1]
    const metricKeys = latest ? Object.keys(latest.data) : []

    // Door summary (last 200 telemetry points for the selected device)
    const doorSummary = useMemo(() => summarizeDoor(seriesAsc.slice(-200)), [seriesAsc]);

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
                        <TelemetryChart data={seriesAsc} keys={metricKeys} />
                    ) : (
                        <div className="text-muted-foreground text-sm">Select a device to see charts.</div>
                    )}
                </CardContent>
            </Card>
            {selected && isDoorDevice && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Door Activity (last 200 points)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:max-w-md">
                            <div className="rounded-xl bg-orange-300/15 border border-green-600/20 p-4">
                                <div className="text-xs uppercase tracking-wide text-green-300/90">Open</div>
                                <div className="text-2xl font-semibold">{doorSummary.open}</div>
                            </div>
                            <div className="rounded-xl bg-zinc-600/15 border border-zinc-600/20 p-4">
                                <div className="text-xs uppercase tracking-wide text-amber-600/90">Closed</div>
                                <div className="text-2xl font-semibold">{doorSummary.closed}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
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