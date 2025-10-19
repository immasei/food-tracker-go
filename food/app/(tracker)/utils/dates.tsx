import { differenceInCalendarDays, isBefore, startOfDay, format, isValid } from "date-fns";
import { Timestamp } from "firebase/firestore";

export const toISO = (v: any) =>
    v instanceof Timestamp ? v.toDate().toISOString() :
    typeof v === "string" ? v : new Date().toISOString();

// return YYYY-MM-DD or null if not provided/invalid
export const toYMD = (v: any): string | null => {
    if (v == null) return null;
    if (typeof v === "string") {
        // accept already-YYYY-MM-DD strings; return trimmed or null if empty
        const s = v.trim();
        return s.length ? s : null;
    }
    const d = v instanceof Timestamp ? v.toDate() : (v instanceof Date ? v : new Date(v));
    return isValid(d) ? format(d, "yyyy-MM-dd") : null;
};

const today = () => startOfDay(new Date());

// if no date -> Infinity days left (never expires)
export const daysLeft = (iso: string | null | undefined): number => {
    if (!iso || !iso.trim()) return Number.POSITIVE_INFINITY;
    const d = new Date(iso);
    if (!isValid(d)) return Number.POSITIVE_INFINITY;
    return differenceInCalendarDays(startOfDay(d), today());
};

// if no date → not expired
export const isExpired = (iso: string | null | undefined): boolean => {
    if (!iso || !iso.trim()) return false;
    const d = new Date(iso);
    if (!isValid(d)) return false;
    return isBefore(startOfDay(d), today());
};