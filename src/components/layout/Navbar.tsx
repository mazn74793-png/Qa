import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoreVertical, X, GraduationCap, LogIn, Settings, Shield, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
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
          (scrolled || !isHomePage) ? "bg-white/90 backdrop-blur-md shadow-sm py-2" : "bg-transparent py-4"
        )}
      >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-white rounded-xl p-1.5 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <GraduationCap className="w-8 h-8 text-primary" />
              )}
            </div>
            <span className={cn(
              "text-lg md:text-xl font-black tracking-tight truncate max-w-[120px] md:max-w-none",
              textColor
            )}>
              {settings?.siteName || 'QA EDUCATION'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-black transition-colors hover:text-accent whitespace-nowrap",
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

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {user ? (
            <Link
              to={isAdmin ? "/admin" : "/portal"}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-black shadow-lg shadow-accent/20 transition-all active:scale-95 hover:scale-105 whitespace-nowrap"
            >
              {isAdmin ? (
                <>
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                  لوحة الإدارة
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                  بوابتي التعليمية
                </>
              )}
            </Link>
          ) : (
            <Link
              to="/portal"
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-black shadow-lg shadow-accent/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
              دخول المنصة
            </Link>
          )}

          {/* Mobile Toggle */}
          <button 
            className={cn(
              "lg:hidden p-2 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center border-2",
              (scrolled || !isHomePage) 
                ? "bg-white text-primary border-slate-100" 
                : "bg-white text-primary border-white"
            )}
            onClick={() => setIsOpen(!isOpen)}
            id="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <MoreVertical className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden bg-white border-b overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-[70] mx-4 mt-2 rounded-[32px] border border-slate-100"
            id="mobile-menu"
          >
            <div className="flex flex-col p-6 gap-3">
              <div className="space-y-1">
                {NAV_LINKS.filter(link => link.href !== '/contact').map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "text-base font-black px-4 py-3.5 rounded-xl transition-all flex items-center justify-between",
                      location.pathname === link.href ? "text-accent bg-accent/5 ring-1 ring-accent/10" : "text-slate-600 hover:bg-slate-50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-2 pt-4 border-t border-slate-100">
                <Link
                  to={isAdmin ? "/admin" : "/portal"}
                  className="flex items-center justify-center gap-3 bg-accent text-white p-4 rounded-2xl font-black shadow-lg shadow-accent/20"
                  onClick={() => setIsOpen(false)}
                >
                  {isAdmin ? <Shield className="w-6 h-6 shrink-0" /> : <GraduationCap className="w-6 h-6 shrink-0" />}
                  {user ? (isAdmin ? 'لوحة تحكم الإدارة' : 'بوابتي التعليمية') : 'تسجيل دخول المنصة'}
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
