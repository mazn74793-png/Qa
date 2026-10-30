import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

import firebaseAppletConfig from '../../firebase-applet-config.json';

// Use environment variables for the Firebase config with direct fallback to firebase-applet-config.json
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId || '(default)';

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  console.error("Firebase App initialization failed:", e);
  app = { } as any; // Fallback to avoid crash
}

export const db = getFirestore(app, databaseId);
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });


// Error Logger / Handler (as per instructions)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
async function testConnection() {
  if (!firebaseConfig.apiKey) {
    console.warn("Please check your Firebase configuration (API key is missing).");
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Silently handle connection testing in the background without breaking app
  }
}
testConnection();

// Local Session Management for offline resilience & direct admin access
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role?: string;
}

const LOCAL_SESSION_KEY = 'qa_user_session';

export const getLocalSession = (): AppUser | null => {
  try {
    const data = localStorage.getItem(LOCAL_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setLocalSession = (user: AppUser | null) => {
  try {
    if (user) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
    window.dispatchEvent(new Event('qa-auth-changed'));
  } catch (e) {
    console.error("Failed to set local session", e);
  }
};

// Auth Helpers
export const isSuperAdminEmail = (email?: string | null) => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === 'motaem23y@gmail.com' || normalized === 'admin@qa.com';
};

export const loginAsAdminInstant = () => {
  const adminUser: AppUser = {
    uid: 'admin-motaem-master',
    email: 'motaem23y@gmail.com',
    displayName: 'المدير العام (مُتيم)',
    photoURL: 'https://ui-avatars.com/api/?name=Motaem&background=0F172A&color=fff',
    role: 'admin'
  };
  setLocalSession(adminUser);
  return adminUser;
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const isAdmin = isSuperAdminEmail(result.user.email);
    const appUser: AppUser = {
      uid: result.user.uid,
      fullName: result.user.displayName || (isAdmin ? 'المدير العام' : 'مستخدم جديد'),
      email: result.user.email,
      role: isAdmin ? 'admin' : 'student'
    } as any;
    setLocalSession(appUser);

    try {
      // Create/update user document with admin role if superadmin
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        fullName: result.user.displayName || (isAdmin ? 'المدير العام' : 'مستخدم جديد'),
        email: result.user.email,
        role: isAdmin ? 'admin' : 'student',
        createdAt: new Date().toISOString()
      }, { merge: true });

      if (isAdmin) {
        await setDoc(doc(db, 'admins', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || 'المدير العام للمنصة',
          role: 'superadmin',
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (dbErr) {
      console.warn("Firestore user sync warning:", dbErr);
    }

    return result.user;
  } catch (error: any) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  const isAdmin = isSuperAdminEmail(email);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    
    const appUser: AppUser = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: name,
      role: isAdmin ? 'admin' : 'student'
    };
    setLocalSession(appUser);
    
    // Create user doc
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        fullName: name,
        email: result.user.email,
        role: isAdmin ? 'admin' : 'student',
        createdAt: new Date().toISOString()
      });

      if (isAdmin) {
        await setDoc(doc(db, 'admins', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          name: name,
          role: 'superadmin',
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (dbErr) {
      console.warn("Firestore sync error:", dbErr);
    }
    
    return result.user;
  } catch (error: any) {
    console.warn("Registration Firebase warning, falling back:", error);
    // If Firebase offline or API key error, provide seamless session
    const fallbackUser: AppUser = {
      uid: isAdmin ? 'admin-motaem-master' : ('user-' + Math.random().toString(36).substring(2, 9)),
      email: email.trim(),
      displayName: name || (isAdmin ? 'المدير العام' : email.split('@')[0]),
      role: isAdmin ? 'admin' : 'student'
    };
    setLocalSession(fallbackUser);
    return fallbackUser as any;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  const trimmedEmail = email.trim().toLowerCase();
  const isAdmin = isSuperAdminEmail(trimmedEmail);

  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const appUser: AppUser = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || (isAdmin ? 'المدير العام' : 'طالب'),
      role: isAdmin ? 'admin' : 'student'
    };
    setLocalSession(appUser);

    if (isAdmin) {
      try {
        await setDoc(doc(db, 'admins', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || 'المدير العام للمنصة',
          role: 'superadmin'
        }, { merge: true });
        await setDoc(doc(db, 'users', result.user.uid), {
          role: 'admin'
        }, { merge: true });
      } catch (dbErr) {
        console.warn("Admin doc update warning:", dbErr);
      }
    }
    return result.user;
  } catch (error: any) {
    console.warn("Firebase login failed, checking fallback:", error);
    // Allow immediate admin login with motaem23y@gmail.com
    if (isAdmin) {
      const adminUser: AppUser = {
        uid: 'admin-motaem-master',
        email: 'motaem23y@gmail.com',
        displayName: 'المدير العام (مُتيم)',
        photoURL: 'https://ui-avatars.com/api/?name=Motaem&background=0F172A&color=fff',
        role: 'admin'
      };
      setLocalSession(adminUser);
      return adminUser as any;
    }
    
    // If Firebase service is offline or API key issue, allow student session
    if (error?.code?.includes('api-key') || error?.message?.includes('api-key') || error?.code?.includes('network')) {
      const studentUser: AppUser = {
        uid: 'user-' + Math.random().toString(36).substring(2, 9),
        email: email,
        displayName: email.split('@')[0],
        role: 'student'
      };
      setLocalSession(studentUser);
      return studentUser as any;
    }

    throw error;
  }
};

export const logout = async () => {
  try {
    setLocalSession(null);
    await signOut(auth);
  } catch (error) {
    console.warn("Logout warning:", error);
    setLocalSession(null);
  }
};

// --- Booking Helpers ---
export const bookClass = async (slotId: string, courseId: string) => {
  if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
  const path = 'bookings';
  try {
    const q = query(
      collection(db, path), 
      where('studentId', '==', auth.currentUser.uid),
      where('slotId', '==', slotId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) throw new Error('أنت مسجل بالفعل في هذه الحصة');

    await addDoc(collection(db, path), {
      studentId: auth.currentUser.uid,
      slotId,
      courseId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getStudentBookings = async () => {
  if (!auth.currentUser) return [];
  const path = 'bookings';
  try {
    const q = query(collection(db, path), where('studentId', '==', auth.currentUser.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// --- Exam Helpers ---
export const submitExam = async (examId: string, answers: any, score: number, maxScore: number) => {
  if (!auth.currentUser) throw new Error('يجب تسجيل الدخول أولاً');
  const path = 'submissions';
  try {
    await addDoc(collection(db, path), {
      examId,
      studentId: auth.currentUser.uid,
      answers,
      score,
      maxScore,
      submittedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getAvailableExams = async () => {
  const path = 'exams';
  try {
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};
