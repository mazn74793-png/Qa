import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { dataService } from '@/src/services/dataService';
import { Plus, Trash2, Edit3, CalendarPlus, Save, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleSlot {
  id?: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  grade: string;
}

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export default function ScheduleManager() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsubscribe = dataService.subscribeSchedule((data) => {
      setSchedule(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      day: formData.get('day') as string,
      time: formData.get('time') as string,
      subject: formData.get('subject') as string,
      teacher: formData.get('teacher') as string,
      grade: formData.get('grade') as string,
    };

    if (editingSlot?.id) {
      await dataService.updateSchedule(editingSlot.id, data);
    } else {
      await dataService.addSchedule(data);
    }
    
    setEditingSlot(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من مسح هذه الحصة؟')) {
      await dataService.deleteSchedule(id);
    }
  };

  if (loading) return <div className="text-center py-20">جاري تحميل الجدول...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-primary">إدارة جدول الحصص</h3>
        <button 
          onClick={() => { setEditingSlot(null); setShowForm(true); }}
          className="bg-accent text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
        >
          <CalendarPlus className="w-5 h-5" />
          إضافة حصة جديدة
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-3xl border-2 border-accent/20 shadow-xl"
          >
            <form onSubmit={handleSave} className="space-y-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">اليوم</label>
                  <select name="day" defaultValue={editingSlot?.day} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right">
                    {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">الوقت</label>
                  <input name="time" defaultValue={editingSlot?.time} required className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="04:00 PM" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">المرحلة</label>
                  <select name="grade" defaultValue={editingSlot?.grade} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right">
                    <option value="الاول الثانوي">الأول الثانوي</option>
                    <option value="الثاني الثانوي">الثاني الثانوي</option>
                    <option value="الثالث الثانوي">الثالث الثانوي</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">المادة</label>
                  <input name="subject" defaultValue={editingSlot?.subject} required className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600">المدرس</label>
                  <input name="teacher" defaultValue={editingSlot?.teacher} required className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-accent text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  حفظ الحصة
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-8 bg-slate-100 text-slate-600 rounded-xl font-bold">إلغاء</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {DAYS.map(day => {
          const daySlots = schedule.filter(s => s.day === day);
          if (daySlots.length === 0) return null;

          return (
            <div key={day} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
              <h4 className="text-lg font-bold text-primary mb-4 pb-2 border-b">{day}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {daySlots.map(slot => (
                  <div key={slot.id} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center group">
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingSlot(slot); setShowForm(true); }} className="p-2 text-blue-600 bg-white rounded-xl shadow-sm hover:bg-blue-50 transition-all">
                        <Edit3 className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDelete(slot.id!)} className="p-2 text-red-500 bg-white rounded-xl shadow-sm hover:bg-red-50 transition-all">
                        <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-primary">{slot.subject}</p>
                       <p className="text-xs text-slate-400">{slot.teacher}</p>
                       <div className="flex items-center gap-1 justify-end mt-2 text-accent text-xs font-bold">
                         <span>{slot.time}</span>
                         <Clock className="w-3 h-3" />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

