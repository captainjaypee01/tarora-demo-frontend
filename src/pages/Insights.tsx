import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchDevices, getInsights } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function Insights() {
    const { data: devices = [], isLoading: isLoadingDevices } = useQuery({ queryKey: ['devices'], queryFn: fetchDevices })
    const [selected, setSelected] = useState<string | undefined>(undefined)
    const [minutes, setMinutes] = useState(60)
    const [summary, setSummary] = useState<string>('')
    const [loading, setLoading] = useState(false)

    async function run() {
        setLoading(true)
        try {

            const text = await getInsights(selected, minutes)
            setSummary(text)
        } catch (error) {
            console.log('error', error);
            toast.error("Unable to run an insight")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Generate Summary</CardTitle>
                </CardHeader>
                <CardContent className="mt-2 grid grid-cols-1 gap-3">
                    <label className="text-sm">Device (optional)</label>
                    <Select value={selected ?? ''} onValueChange={(v) => setSelected(v || undefined)}>
                        <SelectTrigger aria-label="Select device">
                            <SelectValue placeholder={isLoadingDevices ? "Loading devices..." : "Select a device"} />
                        </SelectTrigger>
                        <SelectContent>
                            {devices.length === 0 && !isLoadingDevices ? (
                                <SelectItem disabled value="no">No devices</SelectItem>
                            ) : (
                                devices.map((d) => (
                                    <SelectItem key={d.id} value={d.id ?? ""}>
                                        {d.name} ({d.type})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>

                    <label className="text-sm mt-2">Horizon (minutes)</label>
                    <Input type="number" className="border rounded-xl px-3 py-2" value={minutes} onChange={e => setMinutes(parseInt(e.target.value || '60'))} />
                    <Button onClick={run} disabled={loading}>{loading ? 'Analyzing…' : 'Run Insight'}</Button>
                </CardContent>
            </Card>
            {summary && (
                <Card>
                    <CardHeader><CardTitle>Result</CardTitle></CardHeader>
                    <CardContent>
                        <p className="mt-3 whitespace-pre-wrap text-sm">{summary}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}