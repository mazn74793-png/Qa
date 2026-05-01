import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Facebook, MessageCircle, Instagram } from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/src/services/siteService';

export default function Contact() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  if (!settings) return <div className="min-h-screen flex items-center justify-center font-bold">جاري التحميل...</div>;

  return (
    <div id="contact-page" className="pt-20 md:pt-24 min-h-screen pb-12 md:pb-20">
      <section className="bg-primary text-white py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 md:mb-6">اتصل بنا</h1>
          <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            نحن هنا للإجابة على استفساراتك. تواصل معنا بأي طريقة تفضلها أو قم بزيارة مقر المركز.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-4 md:space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-xl md:rounded-2xl flex items-center justify-center text-accent shrink-0">
                  <Phone className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-right">
                  <h4 className="font-black text-primary mb-1 text-sm md:text-base">اتصل بنا</h4>
                  <p className="text-slate-500 text-xs md:text-sm mb-1 font-bold">{settings.contactPhone}</p>
                  {settings.contactPhoneAlt && <p className="text-slate-500 text-xs md:text-sm font-black">{settings.contactPhoneAlt}</p>}
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-xl md:rounded-2xl flex items-center justify-center text-accent shrink-0">
                  <Mail className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-right">
                  <h4 className="font-black text-primary mb-1 text-sm md:text-base">البريد الإلكتروني</h4>
                  <p className="text-slate-500 text-xs md:text-sm break-all">{settings.contactEmail}</p>
                  {settings.contactEmailAlt && <p className="text-slate-500 text-xs md:text-sm break-all">{settings.contactEmailAlt}</p>}
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 md:gap-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-xl md:rounded-2xl flex items-center justify-center text-accent shrink-0">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-right">
                  <h4 className="font-black text-primary mb-1 text-sm md:text-base">المقر الرئيسي</h4>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{settings.contactAddress}</p>
                </div>
              </div>

              <div className="bg-primary rounded-2xl md:rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-primary/20">
                <div className="relative z-10">
                  <h4 className="font-black mb-4 text-sm md:text-base text-center lg:text-right">تابعنا على السوشيال ميديا</h4>
                  <div className="flex justify-center lg:justify-start gap-3 md:gap-4">
                    <a href={settings.facebookUrl} className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-accent transition-colors shadow-sm"><Facebook className="w-5 h-5 md:w-6 md:h-6" /></a>
                    <a href={settings.instagramUrl} className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-accent transition-colors shadow-sm"><Instagram className="w-5 h-5 md:w-6 md:h-6" /></a>
                    <a href={settings.whatsappUrl} className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-accent transition-colors shadow-sm"><MessageCircle className="w-5 h-5 md:w-6 md:h-6" /></a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl md:rounded-[40px] p-6 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                <h2 className="text-xl md:text-2xl font-black text-primary mb-6 md:mb-8 text-right">أرسل لنا رسالة سريعة</h2>
                <form className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs md:text-sm font-black text-slate-700 mr-1">الاسم بالكامل</label>
                      <input type="text" className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm transition-all" placeholder="أدخل اسمك هنا" />
                    </div>
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs md:text-sm font-black text-slate-700 mr-1">رقم الهاتف</label>
                      <input type="tel" className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm transition-all" placeholder="01xxxxxxxxx" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs md:text-sm font-black text-slate-700 mr-1">البريد الإلكتروني (اختياري)</label>
                    <input type="email" className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm transition-all" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs md:text-sm font-black text-slate-700 mr-1">المرحلة الدراسية</label>
                    <select className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm transition-all appearance-none">
                      <option>المرحلة الثانوية</option>
                      <option>المرحلة الإعدادية</option>
                      <option>المرحلة الابتدائية</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs md:text-sm font-black text-slate-700 mr-1">الرسالة</label>
                    <textarea rows={4} className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm transition-all" placeholder="اكتب استفسارك هنا..."></textarea>
                  </div>
                  <button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-3 text-sm md:text-base active:scale-[0.98]">
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                    إرسال الرسالة الآن
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="h-64 md:h-96 bg-slate-200 rounded-3xl md:rounded-[40px] overflow-hidden shadow-inner relative group border-4 border-white">
          <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.6038504!2d31.2596472!3d30.0594838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583e2341270c57%3A0xc331a98059e6639c!2sCairo%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg" 
            className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="bg-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-2xl flex items-center gap-2 border border-slate-100">
                <MapPin className="text-accent w-4 h-4 md:w-5 md:h-5" />
                <span className="font-bold text-[10px] md:text-sm text-primary">QA Center</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
