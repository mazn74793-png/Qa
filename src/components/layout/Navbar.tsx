import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, LogIn, Settings, Shield, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NAV_LINKS } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { useAdmin } from '@/src/hooks/useAdmin';
import { getSiteSettings, SiteSettings } from '@/src/services/siteService';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const location = useLocation();
  const { isAdmin, user } = useAdmin();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    getSiteSettings().then(setSettings);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = scrolled ? "text-primary" : (isHomePage ? "text-white" : "text-primary");
  const iconColor = scrolled || !isHomePage ? "text-primary" : "text-white";
  const logoBg = "bg-white";

  return (
    <>
      <nav 
        id="main-nav"
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
        )}
      >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white rounded-xl p-1.5 flex items-center justify-center overflow-hidden shadow-sm">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <GraduationCap className="w-8 h-8 text-primary" />
              )}
            </div>
            <span className={cn(
              "text-xl font-black tracking-tight",
              textColor
            )}>
              {settings?.siteName || 'QA EDUCATION'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-bold transition-colors hover:text-accent",
                  location.pathname === link.href 
                    ? "text-accent" 
                    : textColor
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "hidden md:flex items-center gap-2 border px-4 py-2 rounded-full text-xs font-bold transition-all",
                scrolled || !isHomePage ? "border-primary text-primary hover:bg-primary hover:text-white" : "border-white text-white hover:bg-white hover:text-primary"
              )}
            >
              <Shield className="w-4 h-4" />
              لوحة الإدارة
            </Link>
          )}

          <Link
            to="/portal"
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-accent/20 transition-all active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            {user ? 'حسابي' : 'بوابة الطالب'}
          </Link>

          {/* Mobile Toggle */}
          <button 
            className={cn(
              "md:hidden p-2.5 rounded-xl transition-all shadow-sm",
              scrolled || !isHomePage ? "bg-white text-primary" : "bg-primary text-white"
            )}
            onClick={() => setIsOpen(!isOpen)}
            id="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b overflow-hidden shadow-2xl relative z-[70]"
            id="mobile-menu"
          >
            <div className="flex flex-col p-6 gap-4">
              {/* Mobile Contact Quick Links */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-100">
                <a href={`tel:${settings?.contactPhone}`} className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-2xl text-primary hover:bg-accent hover:text-white transition-all">
                  <Phone className="w-5 h-5" />
                  <span className="text-[10px] font-bold">اتصل بنا</span>
                </a>
                <a href={`https://wa.me/${settings?.whatsappUrl}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-2xl text-green-600 hover:bg-green-600 hover:text-white transition-all">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-[10px] font-bold">واتساب</span>
                </a>
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 bg-primary text-white p-4 rounded-2xl font-bold shadow-lg shadow-primary/20"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  لوحة الإدارة
                </Link>
              )}
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-lg font-bold p-3 rounded-xl transition-all",
                    location.pathname === link.href ? "text-accent bg-accent/5" : "text-slate-600 hover:bg-slate-50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-2 pt-4 border-t border-slate-100">
                <Link
                  to="/portal"
                  className="flex items-center justify-center gap-3 bg-accent text-white p-4 rounded-2xl font-bold shadow-lg shadow-accent/20"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  {user ? 'حسابي (بوابة الطالب)' : 'دخول الطلاب'}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
}
