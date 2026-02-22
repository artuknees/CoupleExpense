'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthorized: boolean;
  defaultPayer: 'Jen' | 'Cule';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_EMAILS = {
  JEN: ['artuknees@gmail.com', 'aknees@qwork.com.ar'],
  CULE: ['carolinalainomontoya@gmail.com']
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [defaultPayer, setDefaultPayer] = useState<'Jen' | 'Cule'>('Jen');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email?.toLowerCase();
        const isJen = ALLOWED_EMAILS.JEN.includes(email || '');
        const isCule = ALLOWED_EMAILS.CULE.includes(email || '');

        if (isJen || isCule) {
          setUser(user);
          setIsAuthorized(true);
          setDefaultPayer(isCule ? 'Cule' : 'Jen');
          setError(null);

          // Update or create user in Firestore
          try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: isCule ? 'Cule' : 'Jen',
              lastLogin: serverTimestamp()
            }, { merge: true });
          } catch (e) {
            console.error("Error updating user in Firestore:", e);
          }
        } else {
          await signOut(auth);
          setUser(null);
          setIsAuthorized(false);
          setError("You're neither Cule nor Jen");
        }
      } else {
        setUser(null);
        setIsAuthorized(false);
        setError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/configuration-not-found') {
        setError("Firebase Auth is not configured. Please enable Google Sign-In in the Firebase Console.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized in Firebase. Please add the current URL to 'Authorized domains' in Firebase Console.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in popup was closed before completion.");
      } else {
        setError(err.message || "An error occurred during sign-in.");
      }
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      isAuthorized,
      defaultPayer 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
