import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useAdmin() {
  const [user, authLoading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // 1. Check hardcoded super-admin (the user who requested the app)
      const isSuperAdmin = user.email === 'motaem23y@gmail.com' || user.email === 'admin@qa.com';
      
      if (isSuperAdmin) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // 2. Check Database for admin role
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          // Check user profile for role
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
        }
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading, user };
}
