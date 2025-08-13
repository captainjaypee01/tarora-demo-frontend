import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { type WSEvent } from "@/types/ws";

export function EventFeed({ events }: { events: WSEvent[] }) {
    return (
        <Card className="h-full">
            <CardHeader><CardTitle>Events</CardTitle></CardHeader>
            <CardContent className="h-[280px]">
                <ScrollArea className="h-full pr-2">
                    <ul className="space-y-2">
                        {events.slice().reverse().map((e, i) => (
                            <li key={`${e.device_id}-${e.ts}-${i}`} className="text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs opacity-70">{new Date(e.ts).toLocaleTimeString()}</span>
                                    <span className={`px-2 py-0.5 rounded text-white text-xs ${e.level === "alarm" ? "bg-red-600" : "bg-zinc-600"}`}>
                                        {e.level ?? "info"}
                                    </span>
                                    <span className="font-medium">{e.event}</span>
                                    <span className="ml-2 text-xs opacity-70">
                                        {e.name ?? e.device_id}
                                    </span>
                                </div>
                                {e.details && (
                                    <pre className="text-xs bg-zinc-950/50 text-zinc-200 rounded mt-1 p-2 overflow-x-auto">
                                        {JSON.stringify(e.details, null, 2)}
                                    </pre>
                                )}
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
