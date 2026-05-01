import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronLeft } from 'lucide-react';
import { dataService } from '@/src/services/dataService';

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export default function Schedule() {
  const [activeDay, setActiveDay] = useState('السبت');
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = dataService.subscribeSchedule((data) => {
      setSchedule(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const currentDaySlots = schedule.filter(slot => slot.day === activeDay);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold">جاري تحميل الجدول...</div>;

  return (
    <div id="schedule-page" className="pt-24 min-h-screen bg-slate-50 pb-20">
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-right">
              <h1 className="text-4xl font-bold mb-4">جدول الحصص الأسبوعي</h1>
              <p className="text-white/60">اختر اليوم لعرض المواعيد المتاحة لكل مادة.</p>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/5">
              <Calendar className="w-8 h-8 text-accent" />
              <div>
                <div className="font-bold">العام الدراسي الحالي</div>
                <div className="text-sm text-white/60">2025 - 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Days Selector */}
          <div className="lg:w-1/4 space-y-4">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`w-full p-5 rounded-2xl flex items-center justify-between font-bold transition-all ${
                  activeDay === day 
                  ? 'bg-accent text-white shadow-xl shadow-accent/20 -translate-x-2' 
                  : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{day}</span>
                <ChevronLeft className={`w-5 h-5 transition-transform ${activeDay === day ? 'rotate-0' : 'opacity-0'}`} />
              </button>
            ))}
          </div>

          {/* Schedule Content */}
          <div className="lg:w-3/4 space-y-6">
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 min-h-[500px]">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-primary">حصص يوم {activeDay}</h2>
                <div className="text-slate-500 font-medium">مواعيد دقيقة وحضور إلزامي</div>
              </div>

              <div className="space-y-6">
                {currentDaySlots.length > 0 ? (
                  currentDaySlots.sort((a, b) => a.time.localeCompare(b.time)).map((item, i) => (
                    <div 
                      key={i} 
                      className="group flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-colors relative overflow-hidden"
                    >
                      <div className="absolute right-0 top-0 w-1.5 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl shrink-0 group-hover:bg-accent group-hover:text-white transition-colors min-w-[140px] justify-center">
                        <Clock className="w-6 h-6" />
                        <span className="font-bold text-lg">{item.time}</span>
                      </div>

                      <div className="text-right flex-grow space-y-2">
                        <h4 className="text-xl font-bold text-primary">{item.subject}</h4>
                        <div className="flex items-center gap-4 justify-end text-sm font-medium text-slate-500">
                          <span className="flex items-center gap-1 font-bold"><User className="w-4 h-4 text-accent" /> {item.teacher}</span>
                          <span className="bg-slate-100 px-3 py-1 rounded-full text-xs">{item.grade}</span>
                        </div>
                      </div>

                      <button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all">
                        تسجيل حضور
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-400">لا توجد حصص مجدولة لهذا اليوم حتى الآن.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

