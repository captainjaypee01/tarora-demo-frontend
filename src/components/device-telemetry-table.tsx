import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Telemetry } from "@/lib/api";

export function TelemetryTable({ rows }: { rows: Telemetry[] }) {
    const list = (rows ?? []).slice().reverse(); // newest at bottom without mutating cache
    return (
        <Card>
            <CardHeader><CardTitle className="text-base sm:text-lg">Recent Telemetry</CardTitle></CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Metric</TableHead>
                                <TableHead>Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-muted-foreground text-sm py-8 text-center">
                                        No telemetry yet.
                                    </TableCell>
                                </TableRow>
                            ) : list.flatMap((row, i) =>
                                Object.entries(row.data).map(([k, v], j) => (
                                    <TableRow key={`${i}-${j}`}>
                                        <TableCell className="whitespace-nowrap">{new Date(row.ts).toLocaleString()}</TableCell>
                                        <TableCell>{k}</TableCell>
                                        <TableCell>{String(v)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
