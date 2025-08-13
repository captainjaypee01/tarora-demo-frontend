import * as React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import type { Telemetry } from "@/lib/api"

function formatTs(ts: string) { return new Date(ts).toLocaleTimeString() }

export function TelemetryChart({ data, keys }: { data: Telemetry[]; keys: string[] }) {
    const rows = data.map(d => ({ ts: formatTs(d.ts), ...d.data }))
    const COLORS = ["#60a5fa","#34d399","#f472b6","#f59e0b","#a78bfa","#22d3ee","#ef4444","#10b981"];
    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ts" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {keys.map((k, i) => (<Line key={k} type="monotone" dataKey={k} dot={false} stroke={COLORS[i % COLORS.length]}/>))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}