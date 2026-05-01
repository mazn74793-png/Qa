import { useState, useEffect } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  Search, 
  Video, 
  User, 
  BookOpen,
  X,
  ExternalLink
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

export default function VideoManager() {
  const [videos, setVideos] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    teacherId: '',
    teacherName: '',
    subject: '',
    description: ''
  });

  useEffect(() => {
    // Fetch Videos
    const qVideos = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubVideos = onSnapshot(qVideos, (snapshot) => {
      setVideos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'videos'));

    // Fetch Teachers for the dropdown
    const qTeachers = query(collection(db, 'teachers'), orderBy('name', 'asc'));
    const unsubTeachers = onSnapshot(qTeachers, (snapshot) => {
      setTeachers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubVideos();
      unsubTeachers();
    };
  }, []);

  const handleSave = async () => {
    if (!newVideo.title || !newVideo.url || !newVideo.teacherId) {
      alert('يرجى ملء كافة البيانات الأساسية');
      return;
    }

    // Extract YouTube ID if it's a link
    let finalUrl = newVideo.url;
    if (newVideo.url.includes('youtube.com') || newVideo.url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = newVideo.url.match(regExp);
      if (match && match[2].length === 11) {
        finalUrl = match[2]; // Store only ID
      }
    }

    const teacher = teachers.find(t => t.id === newVideo.teacherId);

    try {
      await addDoc(collection(db, 'videos'), {
        ...newVideo,
        url: finalUrl,
        teacherName: teacher?.name || '',
        subject: teacher?.subject || newVideo.subject,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewVideo({ title: '', url: '', teacherId: '', teacherName: '', subject: '', description: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'videos');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      try {
        await deleteDoc(doc(db, 'videos', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'videos');
      }
    }
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-primary">إدارة المحاضرات المرئية</h2>
          <p className="text-slate-500 text-sm">ارفع فيديوهات الشرح وربطها بالمدرسين والمواد</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-accent/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة فيديو جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-20 text-center animate-pulse font-bold text-slate-300">جاري تحميل الفيديوهات...</div>
        ) : videos.length > 0 ? (
          videos.map((vid) => (
            <div key={vid.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group">
               <div className="aspect-video bg-slate-900 relative">
                  <img 
                    src={`https://img.youtube.com/vi/${vid.url}/mqdefault.jpg`} 
                    className="w-full h-full object-cover opacity-60"
                    alt={vid.title}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-accent/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 group-hover:scale-110 transition-all">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                  </div>
               </div>
               <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-primary line-clamp-1">{vid.title}</h3>
                    <button onClick={() => handleDelete(vid.id)} className="text-red-300 hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-black flex items-center gap-1">
                      <User className="w-3 h-3" /> {vid.teacherName}
                    </span>
                    <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-lg font-black flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {vid.subject}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2">{vid.description || 'لا يوجد وصف متاح لهذا الفيديو'}</p>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-20 rounded-[40px] border border-slate-100 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="text-slate-200 w-8 h-8" />
             </div>
             <p className="text-slate-400 font-bold italic">لا توجد فيديوهات منشورة حالياً</p>
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
                <h2 className="text-3xl font-black text-primary mb-2">إضافة محاضرة مرئية</h2>
                <p className="text-slate-500 font-bold text-sm">أدخل رابط اليوتيوب وسيتم استخراج المحتوى تلقائياً</p>
              </div>

              <div className="space-y-6 text-right">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">عنوان الفيديو</label>
                  <input 
                    type="text" 
                    value={newVideo.title}
                    onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                    placeholder="عنوان المحاضرة (مثال: شرح الباب الأول)"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">رابط الفيديو (YouTube)</label>
                  <input 
                    type="text" 
                    value={newVideo.url}
                    onChange={e => setNewVideo({...newVideo, url: e.target.value})}
                    placeholder="الصق رابط اليوتيوب هنا"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">اختر المدرس</label>
                  <select 
                    value={newVideo.teacherId}
                    onChange={e => setNewVideo({...newVideo, teacherId: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="">-- اختر من طاقم التدريس --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">وصف مختصر</label>
                  <textarea 
                    rows={3}
                    value={newVideo.description}
                    onChange={e => setNewVideo({...newVideo, description: e.target.value})}
                    placeholder="عن ماذا تتحدث هذه المحاضرة؟"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-bold"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleSave}
                    className="flex-[2] bg-primary text-white p-5 rounded-3xl font-black text-lg hover:shadow-2xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Video className="w-6 h-6" />
                    حفظ ونشر الفيديو
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
