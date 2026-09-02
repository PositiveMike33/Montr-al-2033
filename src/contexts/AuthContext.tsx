import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

export interface DbUserProfile {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: User | null;
  dbUser: DbUserProfile | null;
  idToken: string | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
  saveToCloudSql: (gameData: any) => Promise<boolean>;
  loadFromCloudSql: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUserProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);

          // Sync user to Cloud SQL database
          const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setDbUser(data.user);
            }
          }
        } catch (err) {
          console.warn('[AuthContext] Error syncing user with Cloud SQL:', err);
        }
      } else {
        setIdToken(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      setIdToken(token);
      setUser(result.user);

      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setDbUser(data.user);
        }
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User voluntarily closed or cancelled the popup - not an application fault
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setAuthError('La fenêtre de connexion a été bloquée par le navigateur. Ouvrez l\'application dans un nouvel onglet pour autoriser la popup.');
      } else {
        setAuthError(err?.message || 'Erreur d\'authentification Firebase.');
      }
      console.error('[AuthContext] Sign in error:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setDbUser(null);
      setIdToken(null);
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    }
  };

  const saveToCloudSql = async (gameData: any): Promise<boolean> => {
    if (!idToken) return false;
    try {
      const res = await fetch('/api/game/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(gameData),
      });
      return res.ok;
    } catch (err) {
      console.error('[AuthContext] Save to Cloud SQL failed:', err);
      return false;
    }
  };

  const loadFromCloudSql = async (): Promise<any> => {
    if (!idToken) return null;
    try {
      const res = await fetch('/api/game/save', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return data.save || null;
      }
    } catch (err) {
      console.error('[AuthContext] Load from Cloud SQL failed:', err);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        idToken,
        loading,
        authError,
        signInWithGoogle,
        signOutUser,
        clearAuthError,
        saveToCloudSql,
        loadFromCloudSql,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
