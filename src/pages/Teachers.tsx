import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Star, Award, GraduationCap, ChevronLeft, Play, X } from 'lucide-react';
import { dataService } from '@/src/services/dataService';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

function getYoutubeUrl(url: string) {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const id = (match && match[2].length === 11) ? match[2] : null;
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [selectedTeacherSchedule, setSelectedTeacherSchedule] = useState<any | null>(null);
  const [filter, setFilter] = useState('الكل');

  useEffect(() => {
    Promise.all([
      dataService.getTeachers(),
      dataService.getSchedule()
    ]).then(([teachersData, scheduleData]) => {
      setTeachers(teachersData);
      setSchedule(scheduleData);
      setLoading(false);
    });
  }, []);

  const subjects = ['الكل', ...new Set(teachers.map(t => t.subject).filter(Boolean))];
  const filteredTeachers = filter === 'الكل' 
    ? teachers 
    : teachers.filter(t => t.subject === filter);

  const getTeacherSchedule = (teacherName: string) => {
    return schedule.filter(slot => slot.teacher === teacherName);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">جاري تحميل المدرسين...</div>;

  return (
    <div id="teachers-page" className="min-h-screen">
      <section className="bg-primary text-white py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 text-white text-center">نخبة المدرسين</h1>
          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            نفخر بوجود أفضل الكوادر التعليمية في مصر، مدرسون يجمعون بين الخبرة الطويلة والأساليب التربوية الحديثة.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-16">
            {subjects.map(s => (
              <button 
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-4 md:px-6 py-2 rounded-xl md:rounded-2xl text-xs md:text-sm font-black transition-all border",
                  filter === s 
                    ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" 
                    : "bg-white text-slate-500 border-slate-100 hover:border-accent hover:text-accent"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
              {filteredTeachers.map((teacher, i) => (
                <motion.div 
                  key={teacher.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[24px] md:rounded-[40px] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="relative shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[24px] md:rounded-[32px] overflow-hidden border-4 border-slate-50 shadow-inner">
                      <img src={teacher.image || 'https://i.pravatar.cc/150'} alt={teacher.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-accent text-white p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-lg">
                      <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                    </div>
                  </div>

                  <div className="text-right flex-grow w-full">
                    <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-lg text-[10px] md:text-xs font-black mb-2 md:mb-3 uppercase">
                      {teacher.subject}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-primary mb-1 md:mb-2">{teacher.name}</h3>
                    <p className="text-sm text-slate-600 mb-4 md:mb-6 leading-relaxed line-clamp-3">
                      {teacher.bio}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {teacher.introVideoUrl && (
                        <button 
                          onClick={() => setActiveVideo(teacher.introVideoUrl)}
                          className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-primary/10"
                        >
                          <Play className="w-3.5 h-3.5" />
                          نبذة فيديو
                        </button>
                      )}
                        <button 
                          onClick={() => setSelectedTeacherSchedule(teacher)}
                          className="w-full sm:w-auto text-slate-500 font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:text-accent transition-colors py-2"
                        >
                          الجدول الدراسي
                          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold">سيتم الإعلان عن طاقم التدريس قريباً.</div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/95 backdrop-blur-md"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>
              {activeVideo.includes('cloudinary') ? (
                <video 
                  src={activeVideo} 
                  controls 
                  autoPlay 
                  className="w-full h-full border-0"
                />
              ) : (
                <iframe
                  src={getYoutubeUrl(activeVideo)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </motion.div>
          </motion.div>
        )}

        {selectedTeacherSchedule && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl"
            onClick={() => setSelectedTeacherSchedule(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden text-right"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 md:p-10 bg-primary text-white relative">
                 <button 
                    onClick={() => setSelectedTeacherSchedule(null)}
                    className="absolute top-8 left-8 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                 >
                    <X className="w-6 h-6" />
                 </button>
                 <div className="flex items-center gap-6">
                    <img src={selectedTeacherSchedule.image} className="w-20 h-20 rounded-3xl object-cover border-2 border-white/20" />
                    <div>
                       <h3 className="text-2xl md:text-3xl font-black mb-1">{selectedTeacherSchedule.name}</h3>
                       <div className="bg-accent inline-block px-3 py-0.5 rounded-lg text-xs font-black uppercase tracking-tighter shadow-lg shadow-accent/20">
                          جدول حصص {selectedTeacherSchedule.subject}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 md:p-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-4">
                    {getTeacherSchedule(selectedTeacherSchedule.name).length > 0 ? (
                      getTeacherSchedule(selectedTeacherSchedule.name).map((slot, i) => (
                        <motion.div 
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.05 }}
                           key={i} 
                           className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-transparent transition-all group"
                        >
                           <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 font-black text-primary text-lg group-hover:bg-accent group-hover:text-white transition-colors">
                              {slot.time}
                           </div>
                           <div className="flex-grow text-right">
                              <p className="font-black text-slate-400 text-xs mb-1">{slot.day}</p>
                              <h4 className="text-xl font-black text-primary">{slot.grade}</h4>
                           </div>
                           <Link 
                             to="/portal" 
                             className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-accent shadow-lg shadow-primary/10 transition-all active:scale-95"
                           >
                              حجز الحصة 💳
                           </Link>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-20 text-center text-slate-400 font-black italic">
                         لا توجد حصص مجدولة حالياً لهذا المدرس
                      </div>
                    )}
                 </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                 <p className="text-[10px] md:text-xs font-bold text-slate-400">جميع المواعيد قابلة للتغيير بناءً على إدارة السنتر</p>
                 <button 
                   onClick={() => setSelectedTeacherSchedule(null)}
                   className="text-primary font-black hover:text-accent transition-colors"
                 >
                   إغلاق
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

