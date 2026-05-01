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
    <div id="contact-page" className="pt-24 min-h-screen pb-20">
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">اتصل بنا</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            نحن هنا للإجابة على استفساراتك. تواصل معنا بأي طريقة تفضلها أو قم بزيارة مقر المركز.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-primary mb-1">اتصل بنا</h4>
                  <p className="text-slate-500 mb-1">{settings.contactPhone}</p>
                  {settings.contactPhoneAlt && <p className="text-slate-500 font-bold">{settings.contactPhoneAlt}</p>}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-primary mb-1">البريد الإلكتروني</h4>
                  <p className="text-slate-500">{settings.contactEmail}</p>
                  {settings.contactEmailAlt && <p className="text-slate-500">{settings.contactEmailAlt}</p>}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-6">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-primary mb-1">المقر الرئيسي</h4>
                  <p className="text-slate-500 leading-relaxed">{settings.contactAddress}</p>
                </div>
              </div>

              <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-bold mb-4">تابعنا على السوشيال ميديا</h4>
                  <div className="flex gap-4">
                    <a href={settings.facebookUrl} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"><Facebook className="w-5 h-5" /></a>
                    <a href={settings.instagramUrl} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"><Instagram className="w-5 h-5" /></a>
                    <a href={settings.whatsappUrl} className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-accent transition-colors"><MessageCircle className="w-5 h-5" /></a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                <h2 className="text-2xl font-bold text-primary mb-8">أرسل لنا رسالة سريعة</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-right">
                      <label className="text-sm font-bold text-slate-700">الاسم بالكامل</label>
                      <input type="text" className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-2xl p-4 transition-all" placeholder="أدخل اسمك هنا" />
                    </div>
                    <div className="space-y-2 text-right">
                      <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                      <input type="tel" className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-2xl p-4 transition-all" placeholder="01xxxxxxxxx" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-slate-700">البريد الإلكتروني (اختياري)</label>
                    <input type="email" className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-2xl p-4 transition-all" placeholder="email@example.com" />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-slate-700">المرحلة الدراسية</label>
                    <select className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-2xl p-4 transition-all">
                      <option>المرحلة الثانوية</option>
                      <option>المرحلة الإعدادية</option>
                      <option>المرحلة الابتدائية</option>
                    </select>
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-slate-700">الرسالة</label>
                    <textarea rows={4} className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-2xl p-4 transition-all" placeholder="اكتب استفسارك هنا..."></textarea>
                  </div>
                  <button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-5 rounded-2xl shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-3">
                    <Send className="w-5 h-5" />
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
        <div className="h-96 bg-slate-200 rounded-[40px] overflow-hidden shadow-inner relative group">
          <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.6038504!2d31.2596472!3d30.0594838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583e2341270c57%3A0xc331a98059e6639c!2sCairo%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg" 
            className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-slate-100">
                <MapPin className="text-accent w-5 h-5" />
                <span className="font-bold text-primary">QA Center</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
