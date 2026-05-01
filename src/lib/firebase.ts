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
import firebaseConfigFile from '@/firebase-applet-config.json';

// Use environment variables if available (for Vercel/Production), otherwise fallback to the config file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigFile.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigFile.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigFile.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigFile.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigFile.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigFile.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigFile.measurementId,
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigFile.firestoreDatabaseId;

// Debug log for troubleshooting (only showing keys, not values for security)
if (import.meta.env.DEV) {
  console.log("Firebase Config Keys:", Object.keys(firebaseConfig).filter(k => !!(firebaseConfig as any)[k]));
}

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
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    // Silently handle other connection errors in background
  }
}
testConnection();

// Auth Helpers
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Create/update user document if needed
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      fullName: result.user.displayName,
      email: result.user.email,
      role: 'student', // Default role
      createdAt: new Date().toISOString()
    }, { merge: true });
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    
    // Create student doc
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      fullName: name,
      email: result.user.email,
      role: 'student',
      createdAt: new Date().toISOString()
    });
    
    return result.user;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
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
