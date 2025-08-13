import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils
export function summarizeDoor(points: Array<{ data: Record<string, unknown> }>) {
  let open = 0, closed = 0;
  for (const p of points) {
    const v = p.data?.open;
    if (v === true) open++;
    else if (v === false) closed++;
  }
  return { open, closed };
}