import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EventItem } from "@/lib/api";

export function DeviceEventsTable({ rows }: { rows: EventItem[] }) {
    const list = (rows ?? []).slice().reverse(); // newest at bottom without mutating cache
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
                                <TableRow key={e.id}>
                                    <TableCell className="whitespace-nowrap">{new Date(e.ts).toLocaleString()}</TableCell>
                                    <TableCell className="capitalize">{e.level}</TableCell>
                                    <TableCell>{e.event}</TableCell>
                                    <TableCell>
                                        {e.details ? <pre className="text-xs">{JSON.stringify(e.details)}</pre> : "—"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
