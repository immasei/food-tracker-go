import firebaseApp from "../../../config/firebaseConfig";
import { getFirestore, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, collection } from "firebase/firestore";
import { saveRecent, NAMES_KEY, CATS_KEY, loadRecents } from "./recents";
import { Food } from "../types/food";

export const db = getFirestore(firebaseApp);

// TODO: replace with auth.uid later
export const USER_ID = "1";

export async function deleteItem(id: string) {
  await deleteDoc(doc(db, "food", id));
}

export async function upsertItem(editing: Food) {
  const { id, name, category, expiryDate, shared } = editing;
  if (id) {
    await updateDoc(doc(db, "food", id), {
      userId: USER_ID,
      name, category, expiryDate,
      shared: !!shared,
      updatedAt: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, "food"), {
      userId: USER_ID,
      name, category, expiryDate,
      shared: !!shared,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await saveRecent(NAMES_KEY(USER_ID), name);
  await saveRecent(CATS_KEY(USER_ID), category);

  return {
    recentNames: await loadRecents(NAMES_KEY(USER_ID)),
    recentCats: await loadRecents(CATS_KEY(USER_ID)),
  };
}