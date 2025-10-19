// src/features/food/hooks/useFoodItems.ts
import { useEffect, useMemo, useState } from "react";
import {
  collection, query as fsQuery, onSnapshot, orderBy, where, writeBatch, doc, serverTimestamp,
} from "firebase/firestore";
import { db, USER_ID } from "./firebase";
import { daysLeft, isExpired, toISO, toYMD } from "./dates";
import { Food } from "../types/food";

export function useFoodItems(search: string) {
  const [items, setItems] = useState<Food[]>([]);

  useEffect(() => {
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
          name: x.name,
          category: x.category,
          shared: !!x.shared,
          expiryDate: toYMD(x.expiryDate),
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
    const arr = items.filter(
      i =>
        q.length === 0 ||
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
    return arr.sort((a, b) => {
      const ax = isExpired(a.expiryDate) ? 0 : 1;
      const bx = isExpired(b.expiryDate) ? 0 : 1;
      if (ax !== bx) return ax - bx;
      const da = daysLeft(a.expiryDate);
      const db = daysLeft(b.expiryDate);
      if (da !== db) return da - db;
      return a.name.localeCompare(b.name);
    });
  }, [items, search]);

  return { items, filteredSorted, setItems };
}
