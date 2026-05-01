import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { dataService } from '@/src/services/dataService';
import { Plus, Trash2, Edit3, UserPlus, Image as ImageIcon, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Teacher {
  id?: string;
  name: string;
  subject: string;
  image: string;
  bio: string;
  introVideoUrl?: string;
}

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsubscribe = dataService.subscribeTeachers((data) => {
      setTeachers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1000&auto=format&fit=crop',
      bio: formData.get('bio') as string,
      introVideoUrl: formData.get('introVideoUrl') as string,
    };

    if (editingTeacher?.id) {
      await dataService.updateTeacher(editingTeacher.id, data);
    } else {
      await dataService.addTeacher(data);
    }
    
    setEditingTeacher(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من مسح هذا المدرس؟')) {
      await dataService.deleteTeacher(id);
    }
  };

  if (loading) return <div className="text-center py-20">جاري تحميل المعلمين...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-primary">إدارة طاقم التدريس</h3>
        <button 
          onClick={() => { setEditingTeacher(null); setShowForm(true); }}
          className="bg-accent text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          إضافة مدرس جديد
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
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">اسم المدرس</label>
                  <input name="name" defaultValue={editingTeacher?.name} required className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="أ/ محمد علي" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">المادة</label>
                  <input name="subject" defaultValue={editingTeacher?.subject} required className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="اللغة العربية" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600">رابط الصورة (URL)</label>
                  <input name="image" defaultValue={editingTeacher?.image} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="https://..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600">رابط الفيديو التعريفي (YouTube URL)</label>
                  <input name="introVideoUrl" defaultValue={editingTeacher?.introVideoUrl} className="w-full bg-slate-50 border-none rounded-xl p-4 text-left font-mono text-sm" placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600">نبذة تعريفية</label>
                  <textarea name="bio" defaultValue={editingTeacher?.bio} rows={3} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="خبرة 20 عاماً في التدريس..." />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-accent text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  حفظ البيانات
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-8 bg-slate-100 text-slate-600 rounded-xl font-bold">إلغاء</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <motion.div layout key={teacher.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group">
            <div className="flex items-center gap-4 mb-6">
              <img src={teacher.image} alt={teacher.name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-accent/10" />
              <div className="text-right">
                <h4 className="font-bold text-primary">{teacher.name}</h4>
                <p className="text-accent text-sm font-bold">{teacher.subject}</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 text-right">{teacher.bio}</p>
            <div className="flex gap-2 border-t pt-4">
              <button 
                onClick={() => { setEditingTeacher(teacher); setShowForm(true); }}
                className="flex-1 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                تعديل
              </button>
              <button 
                onClick={() => handleDelete(teacher.id!)}
                className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

