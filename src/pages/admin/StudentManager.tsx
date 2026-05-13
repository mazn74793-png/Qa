import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar,
  Shield,
  Trash2,
  Filter,
  Phone,
  School,
  IdCard,
  User as UserIcon,
  X,
  MessageCircle
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { 
  collection, 
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentManager() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    return () => unsub();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الطالب "${name}"؟ هذا سيؤدي لمسح جميع بياناته.`)) {
      try {
        await deleteDoc(doc(db, 'users', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'users');
      }
    }
  };

  const filteredStudents = students.filter(s => {
    const nameToSearch = (s.fullName || s.name || '').toLowerCase();
    const emailToSearch = (s.email || '').toLowerCase();
    const phoneToSearch = (s.phone || '').toLowerCase();
    
    const matchesSearch = nameToSearch.includes(searchTerm.toLowerCase()) || 
                          emailToSearch.includes(searchTerm.toLowerCase()) ||
                          phoneToSearch.includes(searchTerm.toLowerCase());
                          
    const matchesFilter = filter === 'all' || (filter === 'admin' ? s.role === 'admin' : s.role !== 'admin');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-right pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-sm gap-6">
        <div className="text-center md:text-right">
          <h2 className="text-3xl font-black text-primary flex items-center gap-3 justify-center md:justify-end">
            إدارة الطلاب والمستخدمين
            <Users className="text-accent w-8 h-8" />
          </h2>
          <p className="text-slate-500 font-bold mt-1">قاعدة بيانات {students.length} مستخدم مسجل</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           <div className="relative flex-grow min-w-[300px]">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
              <input 
                type="text" 
                placeholder="ابحث بالاسم، البريد، أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] py-4 pr-14 pl-6 text-right font-bold focus:border-accent focus:bg-white transition-all outline-none text-lg"
              />
           </div>
           
           <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-[24px]">
              <button 
                onClick={() => setFilter('admin')}
                className={`px-6 py-3 rounded-[18px] font-black text-sm transition-all ${filter === 'admin' ? 'bg-primary text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
              >
                المشرفين
              </button>
              <button 
                onClick={() => setFilter('user')}
                className={`px-6 py-3 rounded-[18px] font-black text-sm transition-all ${filter === 'user' ? 'bg-primary text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
              >
                الطلاب
              </button>
              <button 
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-[18px] font-black text-sm transition-all ${filter === 'all' ? 'bg-primary text-white shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
              >
                الكل
              </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-slate-400 font-black text-xs uppercase tracking-widest">إجراءات</th>
                <th className="px-8 py-6 text-slate-400 font-black text-xs uppercase tracking-widest">الصف / الحالة</th>
                <th className="px-8 py-6 text-slate-400 font-black text-xs uppercase tracking-widest text-center">التواصل</th>
                <th className="px-8 py-6 text-slate-400 font-black text-xs uppercase tracking-widest">البيانات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                      <div className="w-16 h-16 bg-slate-100 rounded-full" />
                      <p className="text-slate-300 font-black text-xl">جاري استدعاء البيانات...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleDelete(student.id, student.fullName || student.name)}
                          className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                          title="حذف الحساب"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="px-4 py-2 bg-slate-50 text-slate-600 font-black text-xs rounded-xl hover:bg-accent hover:text-white transition-all"
                        >
                          عرض الملف
                        </button>
                        {student.phone && (
                          <a 
                            href={`https://wa.me/${student.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 text-green-500 hover:bg-green-50 rounded-2xl transition-all"
                            title="تواصل واتساب"
                          >
                            <MessageCircle className="w-6 h-6" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          student.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-green-100 text-green-700'
                        }`}>
                          {student.role === 'admin' ? 'مشرف' : 'طالب'}
                        </span>
                        <p className="font-bold text-slate-600 text-sm">{student.grade || 'غير محدد'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-slate-600 font-black text-sm">
                          {student.phone || 'بدون رقم'}
                          <Phone className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-5">
                        <div className="text-right">
                          <p className="font-black text-xl text-primary leading-tight">{student.fullName || student.name || 'مستخدم جديد'}</p>
                          <div className="flex items-center justify-end gap-2 mt-1">
                             <p className="text-xs text-slate-400 font-bold">{student.school || student.email.split('@')[0]}</p>
                             <School className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                        </div>
                        <div className="w-16 h-16 rounded-[24px] bg-slate-100 overflow-hidden border-2 border-white shadow-xl group-hover:scale-105 transition-transform flex-shrink-0">
                          {student.photoURL ? (
                            <img src={student.photoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                               <UserIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-32 text-center text-slate-300 font-black text-2xl italic">
                    لا يوجد أي طلاب تطابق مسارات البحث... 🔍
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[50px] shadow-2xl p-10 md:p-14 my-auto"
            >
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-8 left-8 p-3 bg-slate-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[40px] md:rounded-[55px] bg-slate-100 overflow-hidden border-4 border-white shadow-2xl">
                  {selectedStudent.photoURL ? (
                    <img src={selectedStudent.photoURL} className="w-full h-full object-cover" alt="Student" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Users className="w-16 h-16" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-3xl md:text-5xl font-black text-primary tracking-tighter mb-2">{selectedStudent.fullName || selectedStudent.name}</h3>
                  <div className="flex items-center justify-center gap-3">
                    <span className="bg-accent/10 text-accent px-4 py-1 rounded-full text-xs font-black uppercase">{selectedStudent.grade || 'غير محدد'}</span>
                    <span className="bg-slate-100 text-slate-500 px-4 py-1 rounded-full text-xs font-black uppercase">ID: {selectedStudent.id.slice(0, 10)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-right">
                  <InfoItem icon={Phone} label="رقم الطالب" value={selectedStudent.phone} color="text-blue-500" />
                  <InfoItem icon={Phone} label="رقم ولي الأمر" value={selectedStudent.parentPhone} color="text-green-500" />
                  <InfoItem icon={School} label="المدرسة" value={selectedStudent.school} color="text-orange-500" />
                  <InfoItem icon={Calendar} label="تاريخ الميلاد" value={selectedStudent.birthDate} color="text-purple-500" />
                  <InfoItem icon={Mail} label="البريد الإلكتروني" value={selectedStudent.email} color="text-slate-500" colSpan />
                  
                  {selectedStudent.phone && (
                    <div className="md:col-span-2">
                      <a 
                        href={`https://wa.me/${selectedStudent.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-green-500 text-white p-6 rounded-[30px] font-black flex items-center justify-center gap-3 shadow-xl shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                      >
                        <MessageCircle className="w-7 h-7" />
                        تواصل عبر الواتساب الآن
                      </a>
                    </div>
                  )}

                  <InfoItem 
                    icon={IdCard} 
                    label="تاريخ التسجيل" 
                    value={selectedStudent.createdAt?.toDate ? selectedStudent.createdAt.toDate().toLocaleString('ar-EG') : 'غير متوفر'} 
                    color="text-slate-400" 
                    colSpan 
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, color, colSpan }: any) {
  return (
    <div className={cn("bg-slate-50 p-6 rounded-3xl space-y-1 border border-slate-100", colSpan && "md:col-span-2")}>
      <div className="flex items-center justify-end gap-2 mb-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <p className="text-lg font-black text-primary">{value || 'غير مسجل'}</p>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

