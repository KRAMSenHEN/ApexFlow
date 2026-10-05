import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from '../lib/firebase';
import { UserProfile, UserPresence, PresenceStatus } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  presence: UserPresence | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserStatus: (status: PresenceStatus) => Promise<void>;
  setCurrentActivity: (activity: string, issueId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [presence, setPresence] = useState<UserPresence | null>(null);
  const [loading, setLoading] = useState(true);

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync presence document to Firestore
  const writePresence = useCallback(async (updates: Partial<UserPresence>) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const presenceRef = doc(db, 'presence', uid);
    const newPresenceData: UserPresence = {
      userId: uid,
      status: updates.status || presence?.status || 'online',
      lastSeen: new Date().toISOString(),
      currentActivity: updates.currentActivity ?? presence?.currentActivity ?? 'Active in ApexFlow',
      currentProjectId: updates.currentProjectId ?? presence?.currentProjectId ?? '',
      currentIssueId: updates.currentIssueId ?? presence?.currentIssueId ?? '',
      currentVoiceChannelId: updates.currentVoiceChannelId ?? presence?.currentVoiceChannelId ?? '',
      isMuted: updates.isMuted ?? presence?.isMuted ?? false,
      isDeafened: updates.isDeafened ?? presence?.isDeafened ?? false,
      isCameraOn: updates.isCameraOn ?? presence?.isCameraOn ?? false,
      isScreenSharing: updates.isScreenSharing ?? presence?.isScreenSharing ?? false,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(presenceRef, newPresenceData, { merge: true });
      setPresence(newPresenceData);
    } catch (err) {
      console.warn('Presence sync notice:', err);
    }
  }, [presence]);

  // Handle user activity updates
  const setCurrentActivity = useCallback(async (activity: string, issueId?: string) => {
    await writePresence({
      currentActivity: activity,
      currentIssueId: issueId || '',
    });
  }, [writePresence]);

  const updateUserStatus = useCallback(async (newStatus: PresenceStatus) => {
    await writePresence({ status: newStatus });
  }, [writePresence]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Team Engineer',
        email: user.email || '',
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        role: 'member',
        githubUsername: user.email?.split('@')[0] || 'engineer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userRef, userProfile, { merge: true });
      setProfile(userProfile);
      await writePresence({ status: 'online', currentActivity: 'Logged into ApexFlow' });
    } catch (err) {
      console.error('Google Sign in error:', err);
      throw err;
    }
  };

  // Sign in with Email and Password
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const user = cred.user;
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
      await writePresence({ status: 'online', currentActivity: 'Active in Workspace' });
    } catch (err) {
      console.error('Email sign in error:', err);
      throw err;
    }
  };

  // Sign up with Email and Password
  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const user = cred.user;
      await updateProfile(user, { displayName });

      const userRef = doc(db, 'users', user.uid);
      const userProfile: UserProfile = {
        uid: user.uid,
        displayName: displayName.trim() || email.split('@')[0],
        email: email.trim(),
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        role: 'member',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userRef, userProfile);
      setProfile(userProfile);
      await writePresence({ status: 'online', currentActivity: 'Created account in ApexFlow' });
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'presence', auth.currentUser.uid), {
          status: 'offline',
          lastSeen: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (e) {
        // ignore
      }
    }
    await fbSignOut(auth);
    setCurrentUser(null);
    setProfile(null);
    setPresence(null);
  };

  // Bootstrapping and auth listener
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let p: UserProfile;
        if (userSnap.exists()) {
          p = userSnap.data() as UserProfile;
        } else {
          p = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Team Engineer',
            email: user.email || '',
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
            role: 'member',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userRef, p, { merge: true });
        }
        setProfile(p);
        await writePresence({ status: 'online', currentActivity: 'Active in ApexFlow' });
      } else {
        setProfile(null);
        setPresence(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [writePresence]);

  // Presence heartbeat loop (updates every 25 seconds)
  useEffect(() => {
    if (!currentUser) return;

    heartbeatRef.current = setInterval(() => {
      writePresence({});
    }, 25000);

    const handleUserActivity = () => {
      if (presence?.status === 'away') {
        writePresence({ status: 'online' });
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        writePresence({ status: 'away', currentActivity: 'Away / Inactive' });
      }, 5 * 60 * 1000);
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('focus', handleUserActivity);

    const handleUnload = () => {
      if (auth.currentUser && 'sendBeacon' in navigator) {
        setDoc(doc(db, 'presence', auth.currentUser.uid), {
          status: 'offline',
          lastSeen: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('focus', handleUserActivity);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser, presence?.status, writePresence]);

  // Subscribe to own presence
  useEffect(() => {
    if (!currentUser) return;

    const unsubPresence = onSnapshot(doc(db, 'presence', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setPresence(docSnap.data() as UserPresence);
      }
    });

    return () => unsubPresence();
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        presence,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateUserStatus,
        setCurrentActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
