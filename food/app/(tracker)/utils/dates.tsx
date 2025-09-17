import { differenceInCalendarDays, isBefore, startOfDay, format } from "date-fns";
import { Timestamp } from "firebase/firestore";

export const toISO = (v: any) =>
    v instanceof Timestamp ? v.toDate().toISOString() :
    typeof v === "string" ? v : new Date().toISOString();

export const toYMD = (v: any) => {
    if (typeof v === "string") return v;
    const d = v instanceof Timestamp ? v.toDate() : (v instanceof Date ? v : new Date(v));
    return format(d, "yyyy-MM-dd");
};

const today = () => startOfDay(new Date());

export const daysLeft = (iso: string) => 
    differenceInCalendarDays(
        startOfDay(new Date(iso)), today()
    );

export const isExpired = (iso: string) => 
    isBefore(
        startOfDay(new Date(iso)), today()
    );