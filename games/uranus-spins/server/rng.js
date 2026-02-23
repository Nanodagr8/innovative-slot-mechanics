export function weightedSample(weights) {
    // weights: {name: weight, ...} (not necessarily normalized)
    const entries = Object.entries(weights);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    const r = Math.random() * total;
    let acc = 0;
    for (const [k, w] of entries) {
        acc += w;
        if (r <= acc) return k;
    }
    return entries[0][0];
}
