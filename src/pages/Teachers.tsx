import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Star, Award, GraduationCap, ChevronLeft } from 'lucide-react';
import { dataService } from '@/src/services/dataService';

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                    <button className="text-primary font-bold flex items-center gap-2 hover:text-accent transition-colors">
                      عرض الجدول الدراسي
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">سيتم الإعلان عن طاقم التدريس قريباً.</div>
          )}
        </div>
      </section>
    </div>
  );
}

