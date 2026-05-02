import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock,
  ChevronLeft,
  X,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { uploadToCloudinary } from '@/src/services/uploadService';
import { cn } from '@/src/lib/utils';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

export default function ExamManager() {
  const [exams, setExams] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    duration: 30,
    grade: '',
    teacherId: '',
    teacherName: '',
    image: '',
    questions: [
      { question: '', options: ['', '', '', ''], correct: 0, image: '' }
    ]
  });
  const [uploading, setUploading] = useState<number | string | null>(null);

  useEffect(() => {
    const qExams = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
    const unsubscribeExams = onSnapshot(qExams, (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'exams');
      setLoading(false);
    });

    const qTeachers = query(collection(db, 'teachers'), orderBy('name', 'asc'));
    const unsubscribeTeachers = onSnapshot(qTeachers, (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'teachers');
    });

    return () => {
      unsubscribeExams();
      unsubscribeTeachers();
    };
  }, []);

  const handleFileUpload = async (index: number | string, file: File) => {
    setUploading(index);
    try {
      const url = await uploadToCloudinary(file);
      if (index === 'cover') {
        setNewExam({ ...newExam, image: url });
      } else {
        const qs = [...newExam.questions];
        qs[index as number].image = url;
        setNewExam({ ...newExam, questions: qs });
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في رفع الصورة');
    } finally {
      setUploading(null);
    }
  };

  const handleAddQuestion = () => {
    setNewExam(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correct: 0, image: '' }]
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setNewExam(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!newExam.title || !newExam.teacherName || !newExam.grade) {
      alert('يرجى ملء كافة البيانات الأساسية (العنوان، المدرس، الصف الدراسي)');
      return;
    }
    try {
      await addDoc(collection(db, 'exams'), {
        ...newExam,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewExam({
        title: '',
        duration: 30,
        grade: '',
        teacherId: '',
        teacherName: '',
        image: '',
        questions: [{ question: '', options: ['', '', '', ''], correct: 0, image: '' }]
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'exams');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
      try {
        await deleteDoc(doc(db, 'exams', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'exams');
      }
    }
  };

  return (
    <div className="space-y-6 text-right">
      <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-primary">إدارة الامتحانات</h2>
          <p className="text-slate-500 text-sm">أضف اختبارات جديدة للطلاب وتابع النتائج</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-accent/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          امتحان جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-20 text-center animate-pulse font-bold text-slate-300">جاري تحميل الاختبارات...</div>
        ) : exams.length > 0 ? (
          exams.map((exam) => (
            <div key={exam.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm relative group overflow-hidden">
               <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  <img 
                    src={exam.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'} 
                    className="w-full h-full object-cover" 
                    alt={exam.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 right-4">
                    <span className="bg-accent text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">{exam.grade}</span>
                  </div>
               </div>
               <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-accent">
                      <FileText className="w-5 h-5" />
                    </div>
                    <button 
                      onClick={() => handleDelete(exam.id)}
                      className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
                 <h3 className="font-black text-primary mb-2 line-clamp-1">{exam.title}</h3>
                 <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {exam.duration} دقيقة
                    </span>
                    <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-bold">
                      {exam.questions?.length || 0} سؤال
                    </span>
                 </div>
                 <p className="text-xs text-slate-400 font-bold border-t border-slate-50 pt-4">المدرس: {exam.teacherName}</p>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white p-20 rounded-[40px] border border-slate-100 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-200 w-8 h-8" />
             </div>
             <p className="text-slate-400 font-bold italic">لا توجد اختبارات منشورة حالياً</p>
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
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl p-8 md:p-12 relative"
            >
              <button 
                onClick={() => setShowAdd(false)}
                className="absolute top-6 left-6 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-right mb-8">
                <h2 className="text-3xl font-black text-primary mb-2">تجهيز اختبار جديد</h2>
                <p className="text-slate-500 font-bold text-sm">املأ بيانات الاختبار والأسئلة بدقة</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 text-right">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">عنوان الاختبار</label>
                  <input 
                    type="text" 
                    value={newExam.title}
                    onChange={e => setNewExam({...newExam, title: e.target.value})}
                    placeholder="مثال: الباب الأول"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">الصف الدراسي</label>
                  <select 
                    value={newExam.grade}
                    onChange={e => setNewExam({...newExam, grade: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent rounded-3xl outline-none transition-all font-bold"
                  >
                    <option value="">-- اختر الصف --</option>
                    <option value="1sec">الأول الثانوي</option>
                    <option value="2sec">الثاني الثانوي</option>
                    <option value="3sec">الثالث الثانوي</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 block px-2">اسم المدرس</label>
                  <select 
                    value={newExam.teacherId}
                    onChange={e => {
                      const teacher = teachers.find(t => t.id === e.target.value);
                      setNewExam({
                        ...newExam, 
                        teacherId: e.target.value,
                        teacherName: teacher?.name || ''
                      });
                    }}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-accent focus:bg-white rounded-3xl outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="">-- اختر من طاقم التدريس --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 mb-10 bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-sm font-black text-slate-400 mb-2 text-right">غلاف الامتحان (إختياري):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-bold text-slate-400 block px-2">الخيار 1: رفع من الجهاز</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleFileUpload('cover', e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={cn(
                        "w-full p-4 rounded-2xl border-2 border-white bg-white shadow-sm flex items-center justify-center gap-3 transition-all",
                        newExam.image ? "border-green-500 bg-green-50" : "group-hover:border-accent"
                      )}>
                        {uploading === 'cover' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-accent" />}
                        <span className="font-bold text-slate-400">{newExam.image ? 'تم الرفع بنجاح' : 'اختر صورة'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-bold text-slate-400 block px-2">الخيار 2: رابط صورة</label>
                    <input 
                      type="text" 
                      value={newExam.image}
                      onChange={e => setNewExam({...newExam, image: e.target.value})}
                      placeholder="https://..."
                      className="w-full p-4 bg-white border-2 border-white shadow-sm rounded-2xl outline-none font-bold text-right"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <h3 className="font-black text-primary border-b pb-4 text-right">الأسئلة ({newExam.questions.length})</h3>
                {newExam.questions.map((q, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-[32px] space-y-4 relative border border-slate-100 text-right">
                    <div className="flex justify-between items-center bg-white/50 p-2 rounded-2xl">
                      <span className="font-black text-accent px-4 text-sm">سؤال {idx + 1}</span>
                      <button onClick={() => handleRemoveQuestion(idx)} className="text-red-400 p-2 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <input 
                          type="text"
                          placeholder="اكتب السؤال هنا..."
                          value={q.question}
                          onChange={e => {
                            const qs = [...newExam.questions];
                            qs[idx].question = e.target.value;
                            setNewExam({...newExam, questions: qs});
                          }}
                          className="w-full p-4 bg-white rounded-2xl outline-none font-bold text-sm text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                           <div className="relative flex-grow">
                             <input 
                               type="text"
                               placeholder="رابط صورة السؤال (اختياري)"
                               value={q.image}
                               onChange={e => {
                                 const qs = [...newExam.questions];
                                 qs[idx].image = e.target.value;
                                 setNewExam({...newExam, questions: qs});
                               }}
                               className="w-full p-4 bg-white rounded-2xl outline-none font-bold text-sm pr-10 text-right"
                             />
                             <ImageIcon className="absolute right-3 top-4 w-4 h-4 text-slate-400" />
                           </div>
                           <div className="relative flex-shrink-0">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(idx, file);
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <button type="button" className="bg-white p-4 rounded-2xl text-accent hover:bg-slate-100 transition-all shadow-sm">
                                {uploading === idx ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input 
                            type="radio"
                            name={`correct-${idx}`}
                            checked={q.correct === oIdx}
                            onChange={() => {
                              const qs = [...newExam.questions];
                              qs[idx].correct = oIdx;
                              setNewExam({...newExam, questions: qs});
                            }}
                            className="w-4 h-4 accent-accent"
                          />
                          <input 
                            type="text"
                            placeholder={`اختيار ${oIdx + 1}`}
                            value={opt}
                            onChange={e => {
                              const qs = [...newExam.questions];
                              qs[idx].options[oIdx] = e.target.value;
                              setNewExam({...newExam, questions: qs});
                            }}
                            className="flex-1 p-3 bg-white rounded-xl outline-none text-xs font-medium text-right"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={handleAddQuestion}
                  className="w-full p-4 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-bold flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all"
                >
                  <Plus className="w-5 h-5" />
                  إضافة سؤال آخر
                </button>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleSave}
                  className="flex-[2] bg-primary text-white p-5 rounded-3xl font-black text-lg hover:shadow-2xl hover:shadow-primary/20 transition-all"
                >
                  حفظ ونشر الامتحان
                </button>
                <button 
                  onClick={() => setShowAdd(false)}
                  className="flex-1 bg-slate-50 text-slate-400 p-5 rounded-3xl font-black text-lg hover:bg-slate-100 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
