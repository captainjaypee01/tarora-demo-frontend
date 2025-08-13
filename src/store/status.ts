import { create } from "zustand";

type StatusState = {
    byDevice: Record<string, "online" | "offline" | "unknown">;
    setStatus: (id: string, status: "online" | "offline" | "unknown") => void;
};

export const useStatusStore = create<StatusState>((set) => ({
    byDevice: {},
    setStatus: (id, status) =>
        set((s) => ({ byDevice: { ...s.byDevice, [id]: status } })),
}));