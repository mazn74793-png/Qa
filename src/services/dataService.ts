import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';

// Generic CRUD helper
export const dataService = {
  // Teachers
  async getTeachers() {
    const q = query(collection(db, 'teachers'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  subscribeTeachers(callback: (data: any[]) => void) {
    const q = query(collection(db, 'teachers'), orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'teachers'));
  },
  async addTeacher(data: any) {
    return addDoc(collection(db, 'teachers'), data);
  },
  async updateTeacher(id: string, data: any) {
    return updateDoc(doc(db, 'teachers', id), data);
  },
  async deleteTeacher(id: string) {
    return deleteDoc(doc(db, 'teachers', id));
  },

  // Courses
  async getCourses() {
    const snapshot = await getDocs(collection(db, 'courses'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  subscribeCourses(callback: (data: any[]) => void) {
    return onSnapshot(collection(db, 'courses'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'courses'));
  },
  async addCourse(data: any) {
    return addDoc(collection(db, 'courses'), data);
  },
  async updateCourse(id: string, data: any) {
    return updateDoc(doc(db, 'courses', id), data);
  },
  async deleteCourse(id: string) {
    return deleteDoc(doc(db, 'courses', id));
  },

  // Schedule
  async getSchedule() {
    const snapshot = await getDocs(collection(db, 'schedule'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  subscribeSchedule(callback: (data: any[]) => void) {
    return onSnapshot(collection(db, 'schedule'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'schedule'));
  },
  async addSchedule(data: any) {
    return addDoc(collection(db, 'schedule'), data);
  },
  async updateSchedule(id: string, data: any) {
    return updateDoc(doc(db, 'schedule', id), data);
  },
  async deleteSchedule(id: string) {
    return deleteDoc(doc(db, 'schedule', id));
  },

  // Admins
  subscribeAdmins(callback: (data: any[]) => void) {
    return onSnapshot(collection(db, 'admins'), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'admins'));
  },
  async addAdmin(email: string) {
    return addDoc(collection(db, 'admins'), { 
      email, 
      role: 'admin',
      addedAt: new Date().toISOString() 
    }).catch(e => handleFirestoreError(e, OperationType.WRITE, 'admins'));
  },
  async deleteAdmin(docId: string) {
    return deleteDoc(doc(db, 'admins', docId))
      .catch(e => handleFirestoreError(e, OperationType.DELETE, `admins/${docId}`));
  }
};
