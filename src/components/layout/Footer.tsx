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
    <footer id="main-footer" className="bg-primary text-white pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain bg-white rounded-lg p-1" />
              ) : (
                <GraduationCap className="w-8 h-8 text-accent" />
              )}
              <span className="text-2xl font-bold">{settings?.siteName || 'QA EDUCATION'}</span>
            </div>
            <p className="text-white/60 leading-relaxed text-right md:text-right">
              {settings?.siteDescription || 'مركز QA التعليمي هو رفيقك في طريق النجاح والتميز الدراسي. نوفر بيئة تعليمية متطورة تهدف إلى تنمية مهارات الطلاب.'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">روابط سريعة</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-white/60 hover:text-accent transition-colors">عن السنتر</Link></li>
              <li><Link to="/courses" className="text-white/60 hover:text-accent transition-colors">المواد الدراسية</Link></li>
              <li><Link to="/teachers" className="text-white/60 hover:text-accent transition-colors">نخبة المدرسين</Link></li>
              <li><Link to="/schedule" className="text-white/60 hover:text-accent transition-colors">جدول الحصص</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-6">الدعم والطلاب</h4>
            <ul className="space-y-4">
              <li><Link to="/portal" className="text-white/60 hover:text-accent transition-colors">بوابة الطلاب</Link></li>
              <li><Link to="/portal" className="text-white/60 hover:text-accent transition-colors">بوابة أولياء الأمور</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-accent transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link to="/contact" className="text-white/60 hover:text-accent transition-colors">الدعم الفني</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span className="text-white/60">{settings?.contactAddress || 'القاهرة، مدينة نصر'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span className="text-white/60">{settings?.contactPhone || '01234567890'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span className="text-white/60">{settings?.contactEmail || 'info@qa-education.com'}</span>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-8">
              <a href={settings?.facebookUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={settings?.whatsappUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href={settings?.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} QA Education Center. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
