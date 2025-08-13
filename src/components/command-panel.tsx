import * as React from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { sendCommand } from '../lib/api'

export function CommandPanel({ deviceId }: { deviceId: string }) {
    const [busy, setBusy] = React.useState<string | null>(null)
    const [open, setOpen] = React.useState(false)
    const [metric, setMetric] = React.useState('temp_c')
    const [threshold, setThreshold] = React.useState('28')
    async function run(cmd: string, params: Record<string, any> = {}) {
        setBusy(cmd)
        try { await sendCommand(deviceId, cmd, params) } finally { setBusy(null) }
    }
    return (
        <div className="flex flex-wrap gap-2">
            <Button onClick={() => run('ping')} disabled={!!busy}>{busy === 'ping' ? 'Pinging…' : 'Ping'}</Button>
            <Button variant="outline" onClick={() => run('reboot')} disabled={!!busy}> {busy === 'reboot' ? 'Rebooting...' : 'Reboot'}</Button>
            <Button variant="outline" onClick={() => run('calibrate')} disabled={!!busy}> {busy === 'calibrate' ? 'Calibrating…' : 'Calibrate'}</Button>
            <Button variant="outline" onClick={() => setOpen(true)}>Set Threshold…</Button>

            <Dialog open={open}>
                <DialogContent className="sm:max-w-[425px]">
                <div className="space-y-3">
                    <div className="text-base font-semibold">Set Threshold</div>
                    <div className="grid gap-2">
                        <Label htmlFor="metric">Metric</Label>
                        <Input id="metric" value={metric} onChange={e => setMetric(e.target.value)} />
                        <Label htmlFor="threshold">Threshold</Label>
                        <Input id="threshold" value={threshold} onChange={e => setThreshold(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={async () => { await run('set_threshold', { metric, value: Number(threshold) }); setOpen(false) }}>Save</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </div >
    )
}