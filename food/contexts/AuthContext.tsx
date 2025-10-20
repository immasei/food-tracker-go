// contexts/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import firebaseApp from "../config/firebaseConfig";
import { getFirestore, collection, getDocs, addDoc, setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";

const db = getFirestore(firebaseApp);

export const AuthContext = createContext(undefined as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      console.log(user);
      setAuthChecked(true);
    });
    return unsub;
  }, [auth]);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        setUser(cred.user);
        console.log("Success!!!");
      })
      .catch((error) => {
        console.log("Error!!!");
        console.log(error?.message ?? error);
        throw error;
      });
  }

  async function signup(username: string, phone: string, email: string, password: string) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // add to firebase
      await setDoc(doc(db, "users", user.uid), {
        userid: user.uid,
        username,
        email,
        phone_no: phone,
        createdAt: serverTimestamp(),
      });

      console.log("Registered!!!");
      return user; 
    } catch (error: any) {
      console.log("Register error!!!");
      console.log(error?.message ?? error);
      throw error;
    }
  }

  async function logout() {
    await signOut(auth)
      .then(() => setUser(null))
      .catch((e) => {
        console.log("Logout error", e);
        throw e;
      });
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}
