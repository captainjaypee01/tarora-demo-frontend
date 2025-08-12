import * as React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import type { Telemetry } from "@/lib/api"

function formatTs(ts: string) { return new Date(ts).toLocaleTimeString() }

export function TelemetryChart({ data, keys }: { data: Telemetry[]; keys: string[] }) {
    const rows = data.map(d => ({ ts: formatTs(d.ts), ...d.data }))
    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ts" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {keys.map((k) => (<Line key={k} type="monotone" dataKey={k} dot={false} />))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}