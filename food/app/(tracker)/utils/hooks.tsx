// (tracker)/utils/hooks.tsx
import { useEffect, useMemo, useState } from "react";
import { collection, query as fsQuery, onSnapshot, orderBy, where } from "firebase/firestore";
import { db } from '@/config/firebaseFirestore';
import { COLL } from "@/config/firebaseCollection";
import { toISO, toYMD } from "@/utils/dates";
import { Food } from "@/types/food";
import { sortFoods } from "@/services/foodService";

export function fetchFoods(search: string, USER_ID:string) {
  const [items, setItems] = useState<Food[]>([]);

  useEffect(() => {
    // orderBy(expiryDate) is okay even with nulls
    const q = fsQuery(
      collection(db, COLL.FOOD),
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

    return sortFoods(arr);
  }, [items, search]);

  return { items, filteredSorted, setItems };
}
