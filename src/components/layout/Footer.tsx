import { useState, useEffect } from 'react';
import { GraduationCap, Facebook, Send, MessageCircle, Phone, Mail, MapPin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings, SiteSettings } from '@/src/services/siteService';

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  return (
    <footer id="main-footer" className="bg-slate-900 text-white pt-16 pb-8 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">
          {/* Logo and About */}
          <div className="col-span-1 lg:col-span-1 text-right lg:text-right">
            <div className="flex items-center justify-end lg:justify-start gap-2 mb-6">
              <span className="text-xl md:text-2xl font-black tracking-tighter">{settings?.siteName || 'QA EDUCATION'}</span>
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain bg-white rounded-xl p-1" />
              ) : (
                <GraduationCap className="w-8 h-8 text-accent" />
              )}
            </div>
            <p className="text-white/50 leading-relaxed text-sm">
              {settings?.siteDescription || 'مركز QA التعليمي هو رفيقك في طريق النجاح والتميز الدراسي. نوفر بيئة تعليمية متطورة تهدف إلى تنمية مهارات الطلاب.'}
            </p>
          </div>

          {/* Links */}
          <div className="text-right">
            <h4 className="text-base md:text-lg font-black mb-6 text-white uppercase tracking-widest">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-white/40 hover:text-accent transition-all text-sm font-bold">عن السنتر</Link></li>
              <li><Link to="/courses" className="text-white/40 hover:text-accent transition-all text-sm font-bold">المواد الدراسية</Link></li>
              <li><Link to="/teachers" className="text-white/40 hover:text-accent transition-all text-sm font-bold">نخبة المدرسين</Link></li>
              <li><Link to="/portal" className="text-white/40 hover:text-accent transition-all text-sm font-bold">بوابة الطالب</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-right">
            <h4 className="text-base md:text-lg font-black mb-6 text-white uppercase tracking-widest">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-start justify-end lg:justify-start gap-3">
                <span className="text-white/40 text-sm font-bold">{settings?.contactAddress || 'القاهرة، مدينة نصر'}</span>
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              </li>
              <li className="flex items-center justify-end lg:justify-start gap-3">
                <span className="text-white/40 text-sm font-black">{settings?.contactPhone || '01234567890'}</span>
                <Phone className="w-4 h-4 text-accent shrink-0" />
              </li>
              <li className="flex items-center justify-end lg:justify-start gap-3">
                <span className="text-white/40 text-sm font-bold break-all">{settings?.contactEmail || 'info@qa-education.com'}</span>
                <Mail className="w-4 h-4 text-accent shrink-0" />
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="text-right lg:text-left flex flex-col items-end lg:items-start uppercase">
             <h4 className="text-base md:text-lg font-black mb-6 text-white tracking-widest">تابعنا</h4>
             <div className="flex items-center gap-3">
               <a href={settings?.facebookUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all border border-white/5">
                 <Facebook className="w-5 h-5" />
               </a>
               <a href={settings?.whatsappUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all border border-white/5">
                 <MessageCircle className="w-5 h-5" />
               </a>
               <a href={settings?.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all border border-white/5">
                 <Instagram className="w-5 h-5" />
               </a>
             </div>
             <div className="mt-8 pt-6 border-t border-white/5 w-full text-right lg:text-left">
                <p className="text-[10px] font-black text-white/20">تطوير وبرمجة © 2026</p>
             </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-white/20 text-[10px] md:text-xs font-bold font-mono">
            ALL RIGHTS RESERVED &copy; {new Date().getFullYear()} QA EDUCATION CENTER
          </p>
        </div>
      </div>
    </footer>
  );
}
