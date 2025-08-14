// src/components/device-events-table.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EventItem } from "@/lib/api";
import { toLocalStringStrict } from "@/lib/time";

export function DeviceEventsTable({ rows }: { rows: EventItem[] }) {
    const list = [...(rows ?? [])].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    return (
        <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Device Events</CardTitle></CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground text-sm py-8 text-center">
                                        No events yet.
                                    </TableCell>
                                </TableRow>
                            ) : list.map((e) => (
                                <TableRow key={`${e.id}-${e.ts}`}>
                                    <TableCell className="whitespace-nowrap">{toLocalStringStrict(e.ts)}</TableCell>
                                    <TableCell className="capitalize">{e.level}</TableCell>
                                    <TableCell>{e.event}</TableCell>
                                    <TableCell>{e.details ? <pre className="text-xs">{JSON.stringify(e.details)}</pre> : "—"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
