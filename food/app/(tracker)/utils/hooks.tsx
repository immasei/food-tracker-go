// src/features/food/hooks/useFoodItems.ts
import { useEffect, useMemo, useState } from "react";
import {
  collection, query as fsQuery, onSnapshot, orderBy, where, writeBatch, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { daysLeft, isExpired, toISO, toYMD } from "./dates";
import { Food } from "../types/food";

export function useFoodItems(search: string, USER_ID:string) {
  const [items, setItems] = useState<Food[]>([]);

  useEffect(() => {
    // orderBy(expiryDate) is okay even with nulls
    const q = fsQuery(
      collection(db, "food"),
      where("userId", "==", USER_ID),
      orderBy("expiryDate", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows: Food[] = snap.docs.map((d) => {
        const x = d.data() as any;
        return {
          id: d.id,
          userId: x.userId,
          name: x.name ?? null,
          category: x.category ?? null,
          shared: !!x.shared,
          expiryDate: toYMD(x.expiryDate), // may be null
          createdAt: toISO(x.createdAt),
          updatedAt: x.updatedAt ? toISO(x.updatedAt) : undefined,
        };
      });
      setItems(rows);
    });

    return () => unsub();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const arr = items.filter((i) => {
      if (!q) return true;
      const n = i.name?.toLowerCase() ?? "";
      const c = i.category?.toLowerCase() ?? "";
      return n.includes(q) || c.includes(q);
    });

    return arr.sort((a, b) => {
      // 1) non-expired first > expired next > no-date is considered non-expired
      const ax = isExpired(a.expiryDate) ? 0 : 1;
      const bx = isExpired(b.expiryDate) ? 0 : 1;
      if (ax !== bx) return bx - ax; // want non-expired (1) before expired (0)

      // 2) soonest expiry first > no-date :fnfinity goes to bottom of non-expired bucket
      const da = daysLeft(a.expiryDate);
      const db = daysLeft(b.expiryDate);
      if (da !== db) return da - db;

      // 3) tie-breaker: name (empty strings go last)
      const an = (a.name ?? "").trim();
      const bn = (b.name ?? "").trim();
      if (an && bn) return an.localeCompare(bn);
      if (an && !bn) return -1;
      if (!an && bn) return 1;
      return 0;
    });
  }, [items, search]);

  return { items, filteredSorted, setItems };
}
