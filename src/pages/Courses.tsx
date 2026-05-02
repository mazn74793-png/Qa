import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, GraduationCap, School, ChevronLeft } from 'lucide-react';
import { dataService } from '@/src/services/dataService';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

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
    <div id="courses-page" className="min-h-screen pb-12 md:pb-20">
      <section className="bg-primary text-white py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 text-white text-center">المواد والمراحل الدراسية</h1>
          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            نقدم تغطية شاملة لكافة المناهج الدراسية مع نخبة من أفضل المدرسين في مصر.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          {Object.keys(groupedCourses).length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-16">
              {Object.keys(groupedCourses).map(grade => (
                <button 
                  key={grade}
                  onClick={() => document.getElementById(grade)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="px-4 md:px-6 py-2 bg-white text-slate-500 border border-slate-100 rounded-xl md:rounded-2xl text-xs md:text-sm font-black hover:border-accent hover:text-accent transition-all shadow-sm"
                >
                  {grade}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-12 md:space-y-16">
            {Object.keys(groupedCourses).length > 0 ? (
              Object.entries(groupedCourses).map(([grade, subjects]: any, idx) => (
                <div key={idx} id={grade} className="space-y-6 md:space-y-8 scroll-mt-32">
                  <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-xl md:rounded-2xl flex items-center justify-center text-white shrink-0">
                      {grade.includes('الثانوي') ? <GraduationCap className="w-5 h-5 md:w-6 md:h-6" /> : <School className="w-5 h-5 md:w-6 md:h-6" />}
                    </div>
                    <h2 className="text-xl md:text-3xl font-black text-primary">{grade}</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {subjects.map((sub: any, sIdx: number) => (
                      <motion.div 
                        key={sIdx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: sIdx * 0.1 }}
                        className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                      >
                        <div className="flex justify-between items-start mb-4 md:mb-6">
                          <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl group-hover:bg-accent group-hover:text-white transition-colors relative overflow-hidden w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
                            {sub.image ? (
                              <img src={sub.image} className="w-full h-full object-cover absolute inset-0" alt={sub.name} />
                            ) : (
                              <Book className="w-5 h-5 md:w-6 md:h-6" />
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-lg md:text-xl font-black text-primary mb-1 md:mb-2 text-right">{sub.name}</h3>
                        <div className="text-slate-500 mb-4 md:mb-6 flex items-center gap-2 justify-end text-sm">
                          {sub.teacher}
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        </div>
                        <p className="text-xs md:text-sm text-slate-400 mb-6 text-right line-clamp-2 leading-relaxed">{sub.description}</p>

                        <Link 
                          to="/portal"
                          className="w-full py-3.5 md:py-4 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          تفاصيل الحصص والحجز
                          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-slate-400 font-bold">سيتم إضافة المواد الدراسية قريباً.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

