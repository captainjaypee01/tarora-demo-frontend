export function toLocalStringStrict(ts: string) {
    // If ts has no timezone info, assume UTC by appending 'Z'
    const hasTZ = /[zZ]|[+-]\d{2}:\d{2}$/.test(ts);
    return new Date(hasTZ ? ts : ts + 'Z').toLocaleString();
}

export function toLocalTimeStringStrict(ts: string) {
    const hasTZ = /[zZ]|[+-]\d{2}:\d{2}$/.test(ts);
    return new Date(hasTZ ? ts : ts + 'Z').toLocaleTimeString();
}