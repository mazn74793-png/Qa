import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { dataService } from '@/src/services/dataService';
import { Plus, Trash2, Edit3, BookPlus, Save, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToCloudinary } from '@/src/services/uploadService';
import { cn } from '@/src/lib/utils';

interface Course {
  id?: string;
  name: string;
  grade: string;
  teacher?: string;
  description: string;
  image?: string;
}

export default function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const unsubscribe = dataService.subscribeCourses((data) => {
      setCourses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      let imageUrl = formData.get('image') as string || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1000&auto=format&fit=crop';
      
      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile);
      }

      const data = {
        name: formData.get('name') as string,
        grade: formData.get('grade') as string,
        description: formData.get('description') as string,
        teacher: formData.get('teacher') as string,
        image: imageUrl,
      };

      if (editingCourse?.id) {
        await dataService.updateCourse(editingCourse.id, data);
      } else {
        await dataService.addCourse(data);
      }
      
      setEditingCourse(null);
      setShowForm(false);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert('خطأ في الحفظ');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من مسح هذه المادة؟')) {
      await dataService.deleteCourse(id);
    }
  };

  if (loading) return <div className="text-center py-20">جاري تحميل المواد...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-primary">إدارة المواد الدراسية</h3>
        <button 
          onClick={() => { setEditingCourse(null); setShowForm(true); }}
          className="bg-accent text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
        >
          <BookPlus className="w-5 h-5" />
          إضافة مادة جديدة
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">اسم المادة</label>
                  <input name="name" defaultValue={editingCourse?.name} required className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="فيزياء" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">المرحلة الدراسية</label>
                  <select name="grade" defaultValue={editingCourse?.grade} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right appearance-none">
                    <option value="الاول الثانوي">الأول الثانوي</option>
                    <option value="الثاني الثانوي">الثاني الثانوي</option>
                    <option value="الثالث الثانوي">الثالث الثانوي</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600">اسم المدرس القائم بالمادة</label>
                  <input name="teacher" defaultValue={editingCourse?.teacher} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="أ/ خالد..." />
                </div>
                <div className="space-y-4 md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-xs font-black text-slate-400 mb-2">صورة المادة:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                       <label className="text-[10px] font-bold text-slate-400 block px-2">الخيار 1: رفع صورة من الجهاز</label>
                       <div className="relative group">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className={cn(
                            "w-full p-4 rounded-2xl border-2 border-white bg-white shadow-sm flex items-center justify-center gap-3 transition-all",
                            selectedFile ? "border-green-500 bg-green-50" : "group-hover:border-accent"
                          )}>
                             {selectedFile ? (
                               <>
                                 <ImageIcon className="w-5 h-5 text-green-500" />
                                 <span className="font-bold text-green-700 truncate max-w-[150px]">{selectedFile.name}</span>
                               </>
                             ) : (
                               <>
                                 <Upload className="w-5 h-5 text-accent" />
                                 <span className="font-bold text-slate-400">اختر صورة</span>
                               </>
                             )}
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2 text-right">
                       <label className="text-[10px] font-bold text-slate-400 block px-2">الخيار 2: رابط صورة خارجي (اختياري)</label>
                       <input 
                         name="image" 
                         defaultValue={editingCourse?.image} 
                         disabled={!!selectedFile}
                         className="w-full bg-white border-2 border-white shadow-sm rounded-xl p-4 text-right disabled:opacity-50" 
                         placeholder="https://..." 
                       />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600">وصف المادة</label>
                  <textarea name="description" defaultValue={editingCourse?.description} rows={3} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="شرح مبسط لكافة أجزاء المنهج..." />
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-1 bg-accent text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {uploading ? 'جاري الحفظ...' : 'حفظ البيانات'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} disabled={uploading} className="px-8 bg-slate-100 text-slate-600 rounded-xl font-bold">إلغاء</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group">
            <div className="flex gap-2">
               <button 
                onClick={() => { setEditingCourse(course); setShowForm(true); }}
                className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDelete(course.id!)}
                className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="text-right">
              <h4 className="font-bold text-primary text-lg">{course.name}</h4>
              <p className="text-accent text-sm font-bold mb-1">{course.grade}</p>
              <p className="text-slate-400 text-xs">{course.teacher || 'سيتم التحديد لاحقاً'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

