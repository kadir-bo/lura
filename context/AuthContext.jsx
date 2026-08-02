"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseAuth, getAuthErrorMessage } from "@/lib";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getFirebaseAuth();

  // Listen to auth state changes
  useEffect(() => {
    if (!auth) return null;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setUsername(user.displayName || user.email);
        const tokenResult = await user.getIdTokenResult();
        setIsDemoUser(tokenResult.claims.demo === true);
      } else {
        setUsername(null);
        setIsDemoUser(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // Sign up with email and password
  const signUp = async (email, password) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      return userCredential.user;
    } catch (error) {
      const userFriendlyMessage = getAuthErrorMessage(error);
      setError(userFriendlyMessage);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return userCredential.user;
    } catch (error) {
      const userFriendlyMessage = getAuthErrorMessage(error);
      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  // Starts an isolated, passwordless session for prospective customers.
  const signInAsDemo = async () => {
    try {
      setError(null);
      if (!auth) {
        const configError = new Error("Firebase Auth is not configured.");
        configError.code = "auth/demo-auth-not-configured";
        throw configError;
      }

      const response = await fetch("/api/auth/demo", { method: "POST" });
      const payload = await response.json();

      if (!response.ok || !payload.token) {
        const configError = new Error(
          payload.error || "Demo access is unavailable.",
        );
        configError.code = "auth/demo-auth-not-configured";
        throw configError;
      }

      const userCredential = await signInWithCustomToken(auth, payload.token);
      return userCredential.user;
    } catch (error) {
      console.error("Firebase demo sign-in failed:", error);
      const userFriendlyMessage = getAuthErrorMessage(error);
      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      const userFriendlyMessage = getAuthErrorMessage(error);
      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: "Password reset email sent! Check your inbox.",
      };
    } catch (error) {
      const userFriendlyMessage = getAuthErrorMessage(error);
      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  const values = {
    user,
    username,
    isDemoUser,
    loading,
    error,
    signUp,
    signIn,
    signInAsDemo,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={values}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
