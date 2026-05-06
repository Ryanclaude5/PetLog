import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  return (
    <AuthContext.Provider value={{ user, signOut: () => signOut(auth) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const loginWithEmail = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const registerWithEmail = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
