import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, Eye, Award, History } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/src/services/siteService';

export default function About() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  if (!settings) return <div className="min-h-screen flex items-center justify-center font-bold">جاري التحميل...</div>;

  return (
    <div id="about-page" className="pt-24 min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-white text-center"
          >
            {settings.aboutTitle}
          </motion.h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            تعرف على مسيرتنا في التعليم وكيف نسعى لتغيير مستقبل الطلاب من خلال الابتكار والاحترافية.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-right">
              <div className="inline-flex items-center gap-2 text-accent font-bold mb-4">
                <History className="w-5 h-5" />
                <span>أكثر من 15 عاماً</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight text-right">
                {settings.aboutTitle}
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed text-right">
                {settings.aboutText}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-accent mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-primary mb-2 text-right">{settings.missionTitle}</h4>
                  <p className="text-sm text-slate-500 text-right">{settings.missionText}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-accent mb-4">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-primary mb-2 text-right">رؤيتنا المستقبيلة</h4>
                  <p className="text-sm text-slate-500 text-right">أن نكون المنصة التعليمية الرائدة والأولى في تقديم الحلول التعليمية المتكاملة والمبتكرة.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[40px] overflow-hidden shadow-2xl relative z-10">
                <img 
                  src={settings.aboutImage} 
                  alt="Organization" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
            </div>
          </div>
        </div>
      </section>
      {/* Facilities */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">قاعاتنا التعليمية</h2>
            <p className="text-slate-500">بيئة مجهزة بأحدث الوسائل لراحة الطلاب</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(settings.facilities || []).map((imageUrl, i) => (
              <img 
                key={i}
                src={imageUrl} 
                className="rounded-3xl h-64 w-full object-cover shadow-md hover:scale-105 transition-transform" 
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
