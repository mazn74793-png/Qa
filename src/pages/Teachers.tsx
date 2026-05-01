import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Star, Award, GraduationCap, ChevronLeft, Play, X } from 'lucide-react';
import { dataService } from '@/src/services/dataService';
import { AnimatePresence } from 'motion/react';

function getYoutubeUrl(url: string) {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const id = (match && match[2].length === 11) ? match[2] : null;
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<{ url: string, type?: 'youtube' | 'upload' } | null>(null);

  useEffect(() => {
    dataService.getTeachers().then(data => {
      setTeachers(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">جاري تحميل المعلمين...</div>;

  return (
    <div id="teachers-page" className="pt-24 min-h-screen">
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white text-center">نخبة المدرسين</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            نفخر بوجود أفضل الكوادر التعليمية في مصر، مدرسون يجمعون بين الخبرة الطويلة والأساليب التربوية الحديثة.
          </p>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          {teachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {teachers.map((teacher, i) => (
                <motion.div 
                  key={teacher.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row gap-8 items-center border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="relative shrink-0">
                    <div className="w-40 h-40 rounded-[32px] overflow-hidden border-4 border-slate-50 shadow-inner">
                      <img src={teacher.image || 'https://i.pravatar.cc/150'} alt={teacher.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2 rounded-xl shadow-lg">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                  </div>

                  <div className="text-right flex-grow">
                    <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm font-bold mb-3">
                      {teacher.subject}
                    </div>
                    <h3 className="text-2xl font-bold text-primary mb-2">{teacher.name}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {teacher.bio}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      {teacher.introVideoUrl && (
                        <button 
                          onClick={() => setActiveVideo({ url: teacher.introVideoUrl, type: teacher.videoType })}
                          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-primary/10"
                        >
                          <Play className="w-4 h-4" />
                          نبذة فيديو
                        </button>
                      )}
                      <button className="text-slate-500 font-bold flex items-center gap-2 hover:text-accent transition-colors">
                        الجدول الدراسي
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">سيتم الإعلان عن طاقم التدريس قريباً.</div>
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
              
              {activeVideo.type === 'upload' || (!activeVideo.url.includes('youtube.com') && !activeVideo.url.includes('youtu.be')) ? (
                <video 
                  src={activeVideo.url} 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  src={getYoutubeUrl(activeVideo.url)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

