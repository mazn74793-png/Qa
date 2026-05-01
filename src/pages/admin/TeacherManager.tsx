import { useState, useEffect, useRef } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { dataService } from '@/src/services/dataService';
import { Plus, Trash2, Edit3, UserPlus, Image as ImageIcon, Save, X, Video, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '@/src/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/src/lib/utils';

interface Teacher {
  id?: string;
  name: string;
  subject: string;
  image: string;
  bio: string;
  introVideoUrl?: string;
  videoType?: 'youtube' | 'upload';
}

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = dataService.subscribeTeachers((data) => {
      setTeachers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (editingTeacher) {
      setUploadedVideoUrl(editingTeacher.videoType === 'upload' ? editingTeacher.introVideoUrl || null : null);
    } else {
      setUploadedVideoUrl(null);
    }
  }, [editingTeacher]);

  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('video/')) {
      alert('الرجاء اختيار ملف فيديو فقط');
      return;
    }

    // Check size (max 50MB for now)
    if (file.size > 50 * 1024 * 1024) {
      alert('حجم الفيديو كبير جداً (الحد الأقصى 50 ميجابايت)');
      return;
    }

    setUploading(true);
    setUploadProgress(10); // Start progress

    try {
      const storageRef = ref(storage, `teacher-videos/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setUploadedVideoUrl(url);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
      alert('فشل رفع الفيديو، يرجى المحاولة لاحقاً');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const youtubeUrl = formData.get('introVideoUrl') as string;
    
    // Logic: If we have an uploaded URL, use it. Otherwise use YouTube.
    const finalVideoUrl = uploadedVideoUrl || youtubeUrl;
    const videoType = uploadedVideoUrl ? 'upload' : (youtubeUrl ? 'youtube' : undefined);

    const data = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1000&auto=format&fit=crop',
      bio: formData.get('bio') as string,
      introVideoUrl: finalVideoUrl,
      videoType
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
                  <label className="text-sm font-bold text-slate-600 block">فيديو تعريفي (اختر طريقة واحدة)</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {/* YouTube Choice */}
                    <div className={cn(
                      "p-4 rounded-2xl border-2 transition-all",
                      !uploadedVideoUrl ? "border-accent/40 bg-accent/5" : "border-slate-100 opacity-50"
                    )}>
                      <div className="flex items-center gap-2 mb-3">
                        <Video className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-black">رابط يوتيوب</span>
                      </div>
                      <input 
                        name="introVideoUrl" 
                        defaultValue={editingTeacher?.videoType === 'youtube' ? editingTeacher?.introVideoUrl : ''} 
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-left font-mono text-xs" 
                        placeholder="https://youtube.com/watch?v=..." 
                        disabled={!!uploadedVideoUrl}
                      />
                    </div>

                    {/* Upload Choice */}
                    <div className={cn(
                      "p-4 rounded-2xl border-2 transition-all relative overflow-hidden",
                      uploadedVideoUrl ? "border-accent/40 bg-accent/5" : "border-slate-100"
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-black">رفع من الجهاز</span>
                        </div>
                        {uploadedVideoUrl && (
                          <button 
                            type="button"
                            onClick={() => { setUploadedVideoUrl(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="text-[10px] text-red-500 font-bold hover:underline"
                          >
                            مسح
                          </button>
                        )}
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleVideoUpload}
                        className="hidden" 
                        accept="video/*"
                      />

                      {uploading ? (
                        <div className="flex flex-col items-center justify-center py-2 h-[42px]">
                          <Loader2 className="w-4 h-4 animate-spin text-accent mb-1" />
                          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-accent transition-all" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : uploadedVideoUrl ? (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-accent/20">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-[10px] text-slate-600 truncate flex-1">تم رفع الفيديو بنجاح</span>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all text-xs text-slate-500 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          اختر ملفاً
                        </button>
                      )}
                    </div>
                  </div>
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

