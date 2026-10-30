import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, getLocalSession, isSuperAdminEmail } from '@/src/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

export function useAdmin() {
  const [firebaseUser, authLoading] = useAuthState(auth);
  const [localUser, setLocalUser] = useState<any>(() => getLocalSession());
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isAdminStatusSet, setIsAdminStatusSet] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync with custom local session events
  useEffect(() => {
    const handleAuthChange = () => {
      setLocalUser(getLocalSession());
    };
    window.addEventListener('qa-auth-changed', handleAuthChange);
    return () => window.removeEventListener('qa-auth-changed', handleAuthChange);
  }, []);

  const activeUser = firebaseUser || localUser;

  useEffect(() => {
    // When auth state is still loading and there's no local user, wait
    if (authLoading && !localUser) return;

    // Handle logout or no user state
    if (!activeUser) {
      setIsAdmin(false);
      setIsAdminStatusSet(true);
      setLoading(false);
      return;
    }

    // We have a user, start checking admin status
    let isMounted = true;
    
    // Set loading states before starting the async check
    setLoading(true);
    setIsAdminStatusSet(false);

    const checkAdmin = async () => {
      // 1. Check hardcoded super-admin (synchronous check)
      const isSuperAdmin = isSuperAdminEmail(activeUser.email) || activeUser.role === 'admin';
      
      if (isSuperAdmin) {
        if (isMounted) {
          setIsAdmin(true);
          setIsAdminStatusSet(true);
          setLoading(false);
        }
        return;
      }

      // 2. Check Database for admin status
      try {
        // Priority 1: Check by UID in 'admins' collection
        if (activeUser.uid) {
          const adminDoc = await getDoc(doc(db, 'admins', activeUser.uid));
          if (adminDoc.exists()) {
            if (isMounted) {
              setIsAdmin(true);
              setIsAdminStatusSet(true);
              setLoading(false);
            }
            return;
          }
        }

        // Priority 2: Query by Email in 'admins' collection
        if (activeUser.email) {
          const q = query(
            collection(db, 'admins'), 
            where('email', '==', activeUser.email.toLowerCase()),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            if (isMounted) {
              setIsAdmin(true);
              setIsAdminStatusSet(true);
              setLoading(false);
            }
            return;
          }
        }

        // Priority 3: Check 'role' field in user profile
        if (activeUser.uid) {
          const userDoc = await getDoc(doc(db, 'users', activeUser.uid));
          if (isMounted) {
            setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
          }
        } else {
          if (isMounted) setIsAdmin(false);
        }
        
      } catch (error) {
        console.warn("Admin verification check warning:", error);
        if (isMounted) setIsAdmin(false);
      } finally {
        if (isMounted) {
          setIsAdminStatusSet(true);
          setLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      isMounted = false;
    };
  }, [activeUser, authLoading]);

  // Combined loading state
  const isActuallyLoading = (authLoading && !localUser) || (activeUser && !isAdminStatusSet) || loading;

  return { isAdmin: !!isAdmin, loading: isActuallyLoading, user: activeUser };
}
