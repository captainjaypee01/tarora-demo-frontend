import * as React from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
export function KPI({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
    return (
        <Card>
            <CardHeader>
                <div className="text-sm text-gray-500">{label}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold mt-1">{value}</div>
                {hint && <div className="text-xs text-gray-400 mt-2">{hint}</div>}
            </CardContent>
        </Card>
    )
}