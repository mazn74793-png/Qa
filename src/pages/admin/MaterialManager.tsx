import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  User, 
  BookOpen,
  X,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

export default function MaterialManager() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    url: '',
    teacherId: '',
    teacherName: '',
    subject: '',
    description: ''
  });

  useEffect(() => {
    // Fetch Materials
    const qMaterials = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
    const unsubMaterials = onSnapshot(qMaterials, (snapshot) => {
      setMaterials(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'materials'));

    // Fetch Teachers
    const qTeachers = query(collection(db, 'teachers'), orderBy('name', 'asc'));
    const unsubTeachers = onSnapshot(qTeachers, (snapshot) => {
      setTeachers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubMaterials();
      unsubTeachers();
    };
  }, []);

  const handleSave = async () => {
    if (!newMaterial.title || !newMaterial.url || !newMaterial.teacherId) {
      alert('يرجى ملء كافة البيانات الأساسية');
      return;
    }

    const teacher = teachers.find(t => t.id === newMaterial.teacherId);

    try {
      await addDoc(collection(db, 'materials'), {
        ...newMaterial,
        teacherName: teacher?.name || '',
        subject: teacher?.subject || newMaterial.subject,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewMaterial({ title: '', url: '', teacherId: '', teacherName: '', subject: '', description: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'materials');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المذكرة؟')) {
      try {
        await deleteDoc(doc(db, 'materials', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'materials');
      }
    }
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-primary">إدارة المذكرات والملازم</h2>
          <p className="text-slate-500 text-sm">ارفع روابط المذكرات والملخصات للطلاب</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-accent/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة مذكرة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-20 text-center animate-pulse font-bold text-slate-300">جاري تحميل المذكرات...</div>
        ) : materials.length > 0 ? (
          materials.map((mat) => (
            <div key={mat.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 opacity-20" />
               <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={mat.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-2 text-slate-400 hover:text-accent transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button 
                      onClick={() => handleDelete(mat.id)}
                      className="p-2 text-red-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
               </div>
               <h3 className="font-black text-primary mb-2 line-clamp-1">{mat.title}</h3>
               <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                    <User className="w-3 h-3" /> {mat.teacherName}
                  </span>
                  <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-bold">
                    {mat.subject}
                  </span>
               </div>
               <p className="text-xs text-slate-400 font-medium line-clamp-2 border-t border-slate-50 pt-3">
                 {mat.description || 'لا يوجد وصف متاح'}
               </p>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-20 rounded-[40px] border border-slate-100 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-slate-200 w-8 h-8" />
             </div>
             <p className="text-slate-400 font-bold italic">لا توجد مذكرات مرفوعة حالياً</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-8 md:p-12 relative"
            >
              <button 
                onClick={() => setShowAdd(false)}
                className="absolute top-6 left-6 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-right mb-8">
                <h2 className="text-3xl font-black text-primary mb-2">إضافة مذكرة جديدة</h2>
                <p className="text-slate-500 font-bold text-sm">ارفع المذكرة على Google Drive أو أي موقع والصق الرابط هنا</p>
              </div>

              <div className="space-y-6 text-right">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">عنوان المذكرة</label>
                  <input 
                    type="text" 
                    value={newMaterial.title}
                    onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                    placeholder="مثال: مذكرة الكيمياء العضوية"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">رابط المذكرة (PDF/Link)</label>
                  <input 
                    type="text" 
                    value={newMaterial.url}
                    onChange={e => setNewMaterial({...newMaterial, url: e.target.value})}
                    placeholder="https://drive.google.com/..."
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">اختر المدرس</label>
                  <select 
                    value={newMaterial.teacherId}
                    onChange={e => setNewMaterial({...newMaterial, teacherId: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="">-- اختر من طاقم التدريس --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">وصف المذكرة</label>
                  <textarea 
                    rows={3}
                    value={newMaterial.description}
                    onChange={e => setNewMaterial({...newMaterial, description: e.target.value})}
                    placeholder="اكتب تفاصيل عن المذكرة (اختياري)"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-bold"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleSave}
                    className="flex-[2] bg-primary text-white p-5 rounded-3xl font-black text-lg hover:shadow-2xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-6 h-6" />
                    حفظ المذكرة
                  </button>
                  <button 
                    onClick={() => setShowAdd(false)}
                    className="flex-1 bg-slate-50 text-slate-400 p-5 rounded-3xl font-black text-lg hover:bg-slate-100 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Save({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>
  );
}
