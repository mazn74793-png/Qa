import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

export function useAdmin() {
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isAdminStatusSet, setIsAdminStatusSet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When auth state is still loading, we just wait
    if (authLoading) return;

    // Handle logout or no user state
    if (!user) {
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
      const isSuperAdmin = user.email === 'motaem23y@gmail.com' || user.email === 'admin@qa.com';
      
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
        if (user.uid) {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
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
        if (user.email) {
          const q = query(
            collection(db, 'admins'), 
            where('email', '==', user.email.toLowerCase()),
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
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (isMounted) {
          setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
        }
        
      } catch (error) {
        console.error("Admin verification failed:", error);
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
  }, [user, authLoading]);

  // Combined loading state
  const isActuallyLoading = authLoading || (user && !isAdminStatusSet) || loading;

  return { isAdmin: !!isAdmin, loading: isActuallyLoading, user };
}
