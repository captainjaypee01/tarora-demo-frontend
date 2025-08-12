import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDevices, updateDeviceName, type Device } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../components/ui/table'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

export default function Devices() {
    const qc = useQueryClient()
    const { data: devices = [], isLoading } = useQuery({ queryKey: ['devices'], queryFn: fetchDevices })
    const [editing, setEditing] = React.useState<Record<string, string>>({})

    const m = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => updateDeviceName(id, name),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] })
    })

    function setName(id: string, name: string) { setEditing(prev => ({ ...prev, [id]: name })) }
    function save(id: string) { m.mutate({ id, name: editing[id] }) }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Devices</h1>
            <Card>
                <CardHeader><CardTitle>Manage Devices</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && (<TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow>)}
                                {!isLoading && devices.length === 0 && (<TableRow><TableCell colSpan={4}>No devices.</TableCell></TableRow>)}
                                {!isLoading && devices.map((d: Device) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-mono text-xs">{d.id}</TableCell>
                                        <TableCell>
                                            <Input value={editing[d.id] ?? d.name} onChange={e => setName(d.id, e.target.value)} />
                                        </TableCell>
                                        <TableCell>{d.type}</TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => save(d.id)} disabled={m.isPending}>Save</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}