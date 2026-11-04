export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-07" → "Jul 2026"
export const formatMonth = (ym) => {
    if (!ym) return null;
    const [y, m] = ym.split("-").map(Number);
    return `${MONTHS[m - 1]} ${y}`;
};

// ("2025-06", "2025-08") → "Jun 2025 - Aug 2025"
// ("2025-06", null)      → "Jun 2025 - Present"
export const formatRange = (start, end) => {
    const s = formatMonth(start);
    if (!s) return null;
    return `${s} - ${formatMonth(end) ?? "Present"}`;
};