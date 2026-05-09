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
    <div id="about-page" className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-white py-12 md:py-20 relative overflow-hidden text-right">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-6xl font-black mb-4 md:mb-6 text-white text-right"
          >
            {currentSettings.aboutTitle}
          </motion.h1>
          <p className="text-base md:text-xl text-white/60 max-w-2xl ml-auto leading-relaxed">
            تعرف على مسيرتنا في التعليم وكيف نسعى لتغيير مستقبل الطلاب من خلال الابتكار والاحترافية.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="text-right order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-accent font-bold mb-4">
                <History className="w-4 h-4 md:w-5 h-5" />
                <span className="text-sm md:text-base">أكثر من 15 عاماً</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-primary mb-6 leading-tight text-right">
                {currentSettings.aboutTitle}
              </h2>
              <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed text-right">
                {currentSettings.aboutText}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-accent mb-4 ml-auto">
                    <Target className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h4 className="font-black text-primary mb-2 text-right text-sm md:text-base">{currentSettings.missionTitle}</h4>
                  <p className="text-xs md:text-sm text-slate-500 text-right leading-relaxed">{currentSettings.missionText}</p>
                </div>
                <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-accent mb-4 ml-auto">
                    <Eye className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h4 className="font-black text-primary mb-2 text-right text-sm md:text-base">رؤيتنا المستقبيلة</h4>
                  <p className="text-xs md:text-sm text-slate-500 text-right leading-relaxed">أن نكون المنصة التعليمية الرائدة والأولى في تقديم الحلول التعليمية المتكاملة والمبتكرة.</p>
                </div>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="aspect-video sm:aspect-square rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl relative z-10 border-4 border-white">
                <img 
                  src={currentSettings.aboutImage} 
                  alt="Organization" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-48 md:w-64 h-48 md:h-64 bg-accent/20 rounded-full blur-[60px] md:blur-[80px]" />
            </div>
          </div>
        </div>
      </section>
      {/* Facilities */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-black text-primary mb-2 md:mb-4">قاعاتنا التعليمية</h2>
            <p className="text-sm md:text-base text-slate-500">بيئة مجهزة بأحدث الوسائل لراحة الطلاب</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {(currentSettings.facilities || []).map((imageUrl, i) => (
              <motion.img 
                whileHover={{ scale: 1.02 }}
                key={i}
                src={imageUrl} 
                className="rounded-2xl md:rounded-3xl h-48 md:h-64 w-full object-cover shadow-md transition-transform" 
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
