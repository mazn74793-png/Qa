import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar,
  Shield,
  Trash2,
  Filter
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
import { motion } from 'motion/react';

export default function StudentManager() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'user'>('all');

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
    const matchesSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'admin' ? s.role === 'admin' : s.role !== 'admin');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-right">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-2 justify-end">
            إدارة الطلاب والمستخدمين
            <Users className="text-accent w-7 h-7" />
          </h2>
          <p className="text-slate-500 text-sm">عرض والتحكم في جميع الحسابات المسجلة على المنصة</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <div className="relative flex-grow">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو البريد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3 pr-12 pl-4 text-right font-bold focus:ring-2 focus:ring-accent outline-none"
              />
           </div>
           
           <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl">
              <button 
                onClick={() => setFilter('admin')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${filter === 'admin' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                المشرفين
              </button>
              <button 
                onClick={() => setFilter('user')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${filter === 'user' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                الطلاب
              </button>
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${filter === 'all' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                الكل
              </button>
              <Filter className="w-4 h-4 text-slate-300 mx-2" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-slate-400 font-black text-sm">إجراءات</th>
                <th className="px-6 py-4 text-slate-400 font-black text-sm">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-slate-400 font-black text-sm">الرتبة</th>
                <th className="px-6 py-4 text-slate-400 font-black text-sm">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-slate-400 font-black text-sm">اسم الطالب</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center animate-pulse text-slate-300 font-bold">جاري تحميل قائمة الطلاب...</td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDelete(student.id, student.name)}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="حذف الحساب"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 text-slate-500 text-xs font-bold">
                        {student.createdAt?.toDate ? student.createdAt.toDate().toLocaleDateString('ar-EG') : 'منذ فترة'}
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        student.role === 'admin' 
                        ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                        : 'bg-green-50 text-green-600 border border-green-100'
                      }`}>
                        {student.role === 'admin' ? 'مشرف' : 'طالب'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 text-slate-600 font-medium text-sm">
                        {student.email}
                        <Mail className="w-4 h-4 text-slate-300" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="text-right">
                          <p className="font-black text-primary">{student.name || 'مستخدم جديد'}</p>
                          <p className="text-[10px] text-slate-400">ID: {student.id.slice(0, 8)}...</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-primary border border-slate-200">
                          {student.name ? student.name[0] : <Users className="w-4 h-4" />}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 font-bold italic">
                    لا يوجد نتائج للبحث حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
