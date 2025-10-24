// @/services/userService.tsx
import { db } from '@/config/firebaseFirestore';
import { COLL } from "@/config/firebaseCollection";
import {
  getDoc,
  setDoc,
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { User, ULocation, UStats } from "@/types/user";
import { daysLeft, isExpired } from '@/utils/dates';

// --- doc id is user id

export async function fetchUser(USER_ID: string) {
    const ref = doc(db, COLL.USERS, USER_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const d = snap.data() as any;
    const u: User = {
      id: snap.id,
      userid: d.userid ?? USER_ID,
      username: d.username ?? null,
      email: d.email ?? null,
      phone_no: d.phone_no ?? null,
      location: (d.location ?? null) as ULocation | null,
      pushEnabled: Boolean(d.pushEnabled),
    };
    return u;
}

export async function fetchStats(USER_ID: string) {
  const qFood = query(collection(db, COLL.FOOD), where("userId", "==", USER_ID));
  const snap = await getDocs(qFood);

  let total = 0;
  let expiring = 0;
  let expired = 0;
  let shared = 0;

  snap.forEach((d) => {
    // num total
    const x = d.data() as any;
    total += 1;

    // num shared
    if (x.shared === true) shared += 1;

    // expired and soon expiring (d<=3)
    const ymd = x.expiryDate ?? null;
    if (isExpired(ymd)) {
      expired += 1;
    } else {
      const dl = daysLeft(ymd);
      if (Number.isFinite(dl) && dl <= 3) expiring += 1;
    }
  });

  const userStats: UStats = {
    totalItems: total,
    expiringItems: expiring,
    expiredItems: expired,
    sharedItems: shared,
  };

  return userStats;
}

export async function updateUser(docId: string, user: {}) {
  const ref = doc(db, COLL.USERS, docId);
  await updateDoc(ref, user);
}