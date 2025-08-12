import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const api = axios.create({ baseURL: API_URL })

export type Device = { id: string; name: string; type: string }
export type Telemetry = { device_id: string; ts: string; data: Record<string, any> }

export async function fetchDevices() {
    const { data } = await api.get<Device[]>('/api/devices')
    return data
}

export async function fetchTelemetry(device_id: string, limit = 200) {
    const { data } = await api.get<Telemetry[]>(`/api/telemetry`, { params: { device_id, limit } })
    return data
}

export async function getInsights(device_id?: string, horizon_minutes = 60) {
    const { data } = await api.post<{ summary: string }>(`/api/insights`, { device_id, horizon_minutes })
    return data.summary
}

// Commands & device management — backend to implement per contracts above
export async function sendCommand(device_id: string, command: string, params: Record<string, any> = {}) {
    const { data } = await api.post(`/api/commands`, { device_id, command, params })
    return data
}

export async function updateDeviceName(device_id: string, name: string) {
    const { data } = await api.put(`/api/devices/${device_id}`, { name })
    return data
}