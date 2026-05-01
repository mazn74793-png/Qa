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
    async function checkAdmin() {
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // 1. Check hardcoded super-admin
      const isSuperAdmin = user.email === 'motaem23y@gmail.com' || user.email === 'admin@qa.com';
      
      if (isSuperAdmin) {
        setIsAdmin(true);
        setIsAdminStatusSet(true);
        setLoading(false);
        return;
      }

      // 2. Check Database for admin role
      try {
        // Quick check by UID first (safest method)
        if (user.uid) {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            setIsAdmin(true);
            setIsAdminStatusSet(true);
            setLoading(false);
            return;
          }
        }

        // Search by Email (new method) - more error prone if indices aren't ready
        if (user.email) {
          try {
            const q = query(
              collection(db, 'admins'), 
              where('email', '==', user.email.toLowerCase()),
              limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              setIsAdmin(true);
              setIsAdminStatusSet(true);
              setLoading(false);
              return;
            }
          } catch (qError) {
            console.error("Email query failed (check Firebase indexes):", qError);
          }
        }

        // Check user profile for role
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
        
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
      } finally {
        setIsAdminStatusSet(true);
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user, authLoading]);

  // Combined loading state
  const isActuallyLoading = authLoading || (user && !isAdminStatusSet) || loading;

  return { isAdmin: !!isAdmin, loading: isActuallyLoading, user };
}
