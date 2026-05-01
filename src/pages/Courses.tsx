import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, GraduationCap, School, ChevronLeft } from 'lucide-react';
import { dataService } from '@/src/services/dataService';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getCourses().then(data => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const groupedCourses = courses.reduce((acc: any, course) => {
    const grade = course.grade || 'أخرى';
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(course);
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">جاري تحميل المواد...</div>;

  return (
    <div id="courses-page" className="pt-24 min-h-screen pb-20">
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white text-center">المواد والمراحل الدراسية</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            نقدم تغطية شاملة لكافة المناهج الدراسية مع نخبة من أفضل المدرسين في مصر.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="space-y-16">
            {Object.keys(groupedCourses).length > 0 ? (
              Object.entries(groupedCourses).map(([grade, subjects]: any, idx) => (
                <div key={idx} className="space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white">
                      {grade.includes('الثانوي') ? <GraduationCap className="w-6 h-6" /> : <School className="w-6 h-6" />}
                    </div>
                    <h2 className="text-3xl font-bold text-primary">{grade}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subjects.map((sub: any, sIdx: number) => (
                      <motion.div 
                        key={sIdx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: sIdx * 0.1 }}
                        className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-accent group-hover:text-white transition-colors relative overflow-hidden w-14 h-14 flex items-center justify-center">
                            {sub.image ? (
                              <img src={sub.image} className="w-full h-full object-cover absolute inset-0" alt={sub.name} />
                            ) : (
                              <Book className="w-6 h-6" />
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-primary mb-2 text-right">{sub.name}</h3>
                        <div className="text-slate-500 mb-6 flex items-center gap-2 justify-end">
                          {sub.teacher}
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        </div>
                        <p className="text-sm text-slate-400 mb-6 text-right line-clamp-2">{sub.description}</p>

                        <button className="w-full py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2">
                          تفاصيل الحصص والحجز
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-400">سيتم إضافة المواد الدراسية قريباً.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

