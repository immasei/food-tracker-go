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
} from "firebase/firestore";
import { saveRecent, NAMES_KEY, CATS_KEY, loadRecents } from "@/utils/recents";
import { Food } from "@/types/food";

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

