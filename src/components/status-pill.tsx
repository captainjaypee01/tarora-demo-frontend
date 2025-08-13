import { Badge } from "@/components/ui/badge";

export function StatusPill({ status }: { status?: "online" | "offline" | "unknown" }) {
    const label = status ?? "unknown";
    const color = label === "online" ? "bg-green-600" : label === "offline" ? "bg-gray-400" : "bg-zinc-500";
    return (
        <Badge className={`${color} text-white capitalize`}>{label}</Badge>
    );
}
