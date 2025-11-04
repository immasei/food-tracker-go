// @/services/foodService.tsx
import { db } from '@/config/firebaseFirestore';
import { COLL } from "@/config/firebaseCollection";
import {
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  getCountFromServer
} from "firebase/firestore";
import { saveRecent, NAMES_KEY, CATS_KEY, loadRecents } from "@/utils/recents";
import { Food } from "@/types/food";
import { daysLeft, isExpired, todayYMD } from "@/utils/dates";

export async function deleteFood(id: string) {
  await deleteDoc(doc(db, COLL.FOOD, id));
}

export async function upsertFood(editing: Food, USER_ID: string) {
  const name = editing.name?.trim() || null;
  const category = editing.category?.trim() || null;
  const expiryDate = editing.expiryDate?.trim() || null; // null > never expires
  const shared = !!editing.shared;

  if (editing.id) {
    await updateDoc(doc(db, COLL.FOOD, editing.id), {
      userId: USER_ID,
      name, 
      category, 
      expiryDate,
      shared,
      updatedAt: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, COLL.FOOD), {
      userId: USER_ID,
      name, 
      category, 
      expiryDate,
      shared,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // only store recents if non-empty
  if (name) await saveRecent(NAMES_KEY(USER_ID), name);
  if (category) await saveRecent(CATS_KEY(USER_ID), category);

  return {
    recentNames: await loadRecents(NAMES_KEY(USER_ID)),
    recentCats: await loadRecents(CATS_KEY(USER_ID)),
  };
}

export function sortFoods(items: Food[]): Food[] {
  return [...items].sort((a, b) => {
    // 1) non-expired first > expired next > no-date is considered non-expired
    const ax = isExpired(a.expiryDate) ? 0 : 1;
    const bx = isExpired(b.expiryDate) ? 0 : 1;
    if (ax !== bx) return bx - ax;

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
}

export async function fetchSharedFood(userId: string) {
  const qFood = query(
    collection(db, "food"),
    where("userId", "==", userId),
    where("shared", "==", true),
    where("expiryDate", ">=", todayYMD())
  );
  const snap = await getDocs(qFood);
  const items: Food[] = [];
  snap.forEach((d) => {
    const x = d.data() as any;

    // If expiryDate is stored as "YYYY-MM-DD"
    // const expiryYMD: string | null = x.expiryDate ?? null;

    // Skip if expired or missing a date
    // if (isExpired(expiryYMD)) return;

    items.push({
      id: d.id,
      name: x.name ?? "(Unnamed)",
      category: x.category ?? null,
      // expiryDate: expiryYMD,
      expiryDate: x.expiryDate ?? null,
      shared: !!x.shared,
      userId: x.userId
    });
  });

  return sortFoods(items);
}

export async function fetchSharedFoodCount(userId: string): Promise<number> {
  // 1) shared & future-dated (not expired)
  const qDated = query(
    collection(db, "food"),
    where("userId", "==", userId),
    where("shared", "==", true),
    where("expiryDate", ">=", todayYMD())   // string compare is OK for YYYY-MM-DD
  );
  const c1 = await getCountFromServer(qDated);

  // 2) shared & no-expiry (expiryDate == null)
  const qNoExpiry = query(
    collection(db, "food"),
    where("userId", "==", userId),
    where("shared", "==", true),
    where("expiryDate", "==", null)
  );
  const c2 = await getCountFromServer(qNoExpiry);

  return Number(c1.data().count ?? 0) + Number(c2.data().count ?? 0);
  
  
}

