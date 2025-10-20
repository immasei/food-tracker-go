// contexts/AuthContext.tsx
import React, { createContext, useEffect, useMemo, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import firebaseApp from "../config/firebaseConfig";

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

  async function signup(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        setUser(cred.user);
        console.log("Registered!!!");
      })
      .catch((error) => {
        console.log("Register error!!!");
        console.log(error?.message ?? error);
        throw error;
      });
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
