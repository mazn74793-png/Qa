import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, User, ChevronLeft, Search, Filter } from 'lucide-react';
import { dataService } from '@/src/services/dataService';

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export default function Schedule() {
  const [activeDay, setActiveDay] = useState('السبت');
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const unsubscribe = dataService.subscribeSchedule((data) => {
      setSchedule(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredSchedule = schedule.filter(slot => 
    slot.day === activeDay && 
    (slot.subject.includes(filter) || slot.teacher.includes(filter))
  );

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-xl animate-pulse">جاري تحميل الجدول... 🗓️</div>;

  return (
    <div id="schedule-page" className="pt-24 min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-right">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl mb-4"
              >
                 <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                 <span className="text-sm font-black uppercase tracking-widest text-accent">المواعيد الدراسية</span>
              </motion.div>
              <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">جدول الحصص الأسبوعي</h1>
              <p className="text-xl text-white/50 font-bold max-w-xl">نظم وقتك ودراستك مع التحديثات اللحظية لمواعيد سنتر QA التعليمي.</p>
            </div>

            <div className="relative group lg:block hidden">
              <div className="absolute -inset-4 bg-accent/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white/5 backdrop-blur-3xl p-8 rounded-[48px] border border-white/10 flex items-center gap-6 shadow-2xl">
                 <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-accent/40 rotate-3 group-hover:rotate-0 transition-transform">
                    <Calendar className="w-10 h-10 text-white" />
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-white/30 uppercase tracking-widest">العام الدراسي</p>
                    <p className="text-3xl font-black">2025 - 2026</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 -mt-12 relative z-20">
         <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 p-4 mb-8">
            <div className="flex flex-wrap items-center gap-4 p-2 justify-end">
               {DAYS.map((day) => (
                 <button
                   key={day}
                   onClick={() => setActiveDay(day)}
                   className={`px-8 py-4 rounded-2xl font-black transition-all text-lg whitespace-nowrap ${
                     activeDay === day 
                     ? 'bg-accent text-white shadow-xl shadow-accent/30 scale-105' 
                     : 'bg-transparent text-slate-400 hover:bg-slate-50'
                   }`}
                 >
                   {day}
                 </button>
               ))}
            </div>
         </div>

        <div className="max-w-5xl mx-auto space-y-8">
           {/* Quick Search */}
           <div className="relative">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
              <input 
                type="text" 
                placeholder="ابحث عن مادة أو مدرس محدد..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 h-16 pr-16 pl-8 rounded-3xl font-bold text-lg focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all shadow-sm"
              />
           </div>

           <div className="bg-white rounded-[50px] overflow-hidden shadow-sm border border-slate-100 min-h-[400px]">
              <div className="p-8 md:p-12">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="text-right">
                       <h2 className="text-3xl font-black text-primary">حصص يوم {activeDay}</h2>
                       <p className="text-slate-400 font-bold">يتم تحديث المواعيد تلقائياً</p>
                    </div>
                    {filteredSchedule.length > 0 && (
                      <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-slate-500 font-black flex items-center gap-2">
                         <span className="text-primary">{filteredSchedule.length}</span>
                         حصة متاحة
                      </div>
                    )}
                 </div>

                 <div className="space-y-6">
                    <AnimatePresence mode="wait">
                       <motion.div
                         key={activeDay + filter}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         className="space-y-6"
                       >
                          {filteredSchedule.length > 0 ? (
                            filteredSchedule.sort((a, b) => a.time.localeCompare(b.time)).map((item, i) => (
                              <div 
                                key={i} 
                                className="group flex flex-col md:flex-row items-center gap-8 p-8 rounded-[40px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-transparent transition-all duration-300 relative"
                              >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                                
                                <div className="flex flex-col items-center justify-center bg-white w-full md:w-32 h-32 rounded-[32px] shadow-sm border border-slate-100 group-hover:bg-accent group-hover:text-white transition-all group-hover:-rotate-3">
                                  <Clock className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100" />
                                  <span className="font-black text-xl">{item.time}</span>
                                </div>

                                <div className="text-right flex-grow space-y-3">
                                  <div className="flex items-center justify-end gap-2">
                                     <span className="bg-accent/10 text-accent px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                        {item.grade}
                                     </span>
                                  </div>
                                  <h4 className="text-3xl font-black text-primary">{item.subject}</h4>
                                  <div className="flex items-center gap-3 justify-end text-slate-500">
                                    <span className="flex items-center gap-2 font-black text-lg">
                                       <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                          <img src={`https://i.pravatar.cc/100?u=${item.teacher}`} className="w-full h-full object-cover" />
                                       </div>
                                       {item.teacher}
                                    </span>
                                  </div>
                                </div>

                                <button className="w-full md:w-auto bg-primary hover:bg-accent text-white px-10 py-5 rounded-3xl font-black text-lg transition-all shadow-xl shadow-primary/20 hover:shadow-accent/40 active:scale-95">
                                  تسجيل حضور
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="py-32 flex flex-col items-center text-center">
                               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                  <Search className="w-10 h-10 text-slate-300" />
                               </div>
                               <h3 className="text-2xl font-black text-primary mb-2">لا توجد نتائج</h3>
                               <p className="text-slate-400 font-bold">جرب البحث بكلمات أخرى أو اختر يوماً آخر</p>
                            </div>
                          )}
                       </motion.div>
                    </AnimatePresence>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}

