import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Search, 
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  Download
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import { motion } from 'motion/react';

export default function BookingManager() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async (d) => {
        const bookingData = d.data() as any;
        const booking = { id: d.id, ...bookingData };
        // Fetch student name & course details
        try {
          const uDoc = await getDocFromServer(doc(db, 'users', bookingData.studentId));
          const sDoc = await getDocFromServer(doc(db, 'schedule', bookingData.slotId));
          return { 
            ...booking, 
            studentName: uDoc.exists() ? uDoc.data().fullName : 'طالب غير مسجل',
            className: sDoc.exists() ? sDoc.data().subject : 'حصة غير معروفة',
            teacherName: sDoc.exists() ? sDoc.data().teacher : 'مدرس غير معروف'
          };
        } catch {
          return { ...booking, studentName: 'خطأ في التحميل', className: 'خطأ' };
        }
      }));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'bookings');
      }
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.studentName?.toLowerCase().includes(filter.toLowerCase()) ||
    b.className?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 text-right">
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-primary">سجل الحجوزات</h2>
          <p className="text-slate-500 text-sm">تتبع كافة حجوزات الطلاب للحصص المختلفة</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-4">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                type="text"
                placeholder="بحث باسم الطالب أو الحصة..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-accent p-3 pr-10 rounded-2xl outline-none text-xs font-bold transition-all"
              />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
             <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                   <th className="p-6">الطالب</th>
                   <th className="p-6">الحصة / المدرس</th>
                   <th className="p-6">التاريخ والوقت</th>
                   <th className="p-6">رقم الحجز</th>
                   <th className="p-6">الإجراءات</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center animate-pulse font-bold text-slate-300">جاري تحميل سجلات الحجز...</td></tr>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="p-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-bold">
                                {b.studentName?.[0]}
                             </div>
                             <div>
                                <p className="font-black text-primary text-sm">{b.studentName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{b.studentId}</p>
                             </div>
                          </div>
                       </td>
                       <td className="p-6">
                          <p className="font-bold text-slate-700">{b.className}</p>
                          <p className="text-[10px] text-accent font-black">{b.teacherName}</p>
                       </td>
                       <td className="p-6">
                          <p className="text-sm text-slate-600 font-medium">{(b.createdAt as any)?.toDate?.().toLocaleString('ar-EG') || 'حديثاً'}</p>
                       </td>
                       <td className="p-6">
                          <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-400 font-mono uppercase">{b.id.slice(0, 8)}</span>
                       </td>
                       <td className="p-6">
                          <button 
                            onClick={() => handleDelete(b.id)}
                            className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            title="حذف الحجز"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-200 font-black italic">لا توجد سجلات مطابقة للبحث</td></tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
