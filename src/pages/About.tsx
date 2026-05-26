import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Eye, Award, History } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/src/services/siteService';

export default function About() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(data => {
      setSettings(data);
    }).catch(() => {
      // getSiteSettings already handles its own errors and returns DEFAULT_SETTINGS,
      // but if something goes wrong, we ensure we have data.
    });
  }, []);

  const currentSettings = settings;

  if (!currentSettings) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-black text-primary">جاري تحميل المعلومات...</p>
      </div>
    );
  }

  return (
    <div id="about-page" className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white text-slate-900 py-12 md:py-20 relative overflow-hidden text-right border-b border-slate-50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-2xl" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-6xl font-black mb-4 md:mb-6 text-primary text-right tracking-tighter"
          >
            {currentSettings.aboutTitle}
          </motion.h1>
          <p className="text-base md:text-xl text-slate-500 max-w-2xl ml-auto leading-relaxed font-bold">
            تعرف على مسيرتنا في التعليم وكيف نسعى لتغيير مستقبل الطلاب من خلال الابتكار والاحترافية.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-right order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 text-accent font-bold mb-4">
                <History className="w-4 h-4 md:w-5 h-5" />
                <span className="text-sm md:text-base tracking-widest uppercase">أكثر من 15 عاماً من الخبرة</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-primary mb-6 leading-tight text-right">
                {currentSettings.aboutTitle}
              </h2>
              <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed text-right font-medium">
                {currentSettings.aboutText}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-accent mb-4 ml-auto">
                    <Target className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h4 className="font-black text-primary mb-2 text-right text-sm md:text-base">{currentSettings.missionTitle}</h4>
                  <p className="text-xs md:text-sm text-slate-500 text-right leading-relaxed font-medium">{currentSettings.missionText}</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-accent mb-4 ml-auto">
                    <Eye className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h4 className="font-black text-primary mb-2 text-right text-sm md:text-base">رؤيتنا المستقبيلة</h4>
                  <p className="text-xs md:text-sm text-slate-500 text-right leading-relaxed font-medium">أن نكون المنصة التعليمية الرائدة والأولى في تقديم الحلول التعليمية المتكاملة والمبتكرة.</p>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative order-1 lg:order-2"
            >
              <div className="aspect-video sm:aspect-square rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl relative z-10 border-4 border-white">
                <img 
                  src={currentSettings.aboutImage} 
                  alt="Organization" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-48 md:w-64 h-48 md:h-64 bg-rose-500/5 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-primary mb-2 md:mb-4">قاعاتنا التعليمية</h2>
            <p className="text-sm md:text-base text-slate-500 font-bold">بيئة مجهزة بأحدث الوسائل لراحة الطلاب</p>
          </div>
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8"
          >
            {(currentSettings.facilities || []).map((imageUrl, i) => (
              <motion.img 
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  show: { opacity: 1, scale: 1 }
                }}
                whileHover={{ scale: 1.02 }}
                key={i}
                src={imageUrl} 
                className="rounded-2xl md:rounded-3xl h-48 md:h-64 w-full object-cover shadow-md transition-transform" 
                referrerPolicy="no-referrer"
              />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
