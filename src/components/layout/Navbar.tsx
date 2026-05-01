import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, LogIn, Settings, Shield, Phone, Mail, MapPin } from 'lucide-react';
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
  const logoBg = scrolled ? "bg-primary" : (isHomePage ? "bg-primary" : "bg-primary");

  return (
    <>
      {/* Top Bar info */}
      {!scrolled && isHomePage && (
        <div className="fixed top-0 w-full z-[60] bg-primary/20 backdrop-blur-sm border-b border-white/10 hidden md:block">
          <div className="container mx-auto px-4 py-1.5 flex justify-between items-center text-[10px] font-bold text-white/80">
            <div className="flex items-center gap-6">
              <a href={`tel:${settings?.contactPhone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-3 h-3 text-accent" />
                {settings?.contactPhone}
              </a>
              <a href={`mailto:${settings?.contactEmail}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-3 h-3 text-accent" />
                {settings?.contactEmail}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-60">{settings?.contactAddress}</span>
              <MapPin className="w-3 h-3 text-accent" />
            </div>
          </div>
        </div>
      )}

      <nav 
        id="main-nav"
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-2" : (isHomePage ? "bg-transparent py-4 mt-8" : "bg-white py-2 shadow-sm")
        )}
      >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white rounded-lg p-1.5 flex items-center justify-center overflow-hidden">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
              ) : (
                <GraduationCap className="w-6 h-6 text-white" />
              )}
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight",
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
                  "text-sm font-medium transition-colors hover:text-accent",
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
                "hidden md:flex items-center gap-2 border px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                scrolled || !isHomePage ? "border-primary text-primary hover:bg-primary hover:text-white" : "border-white text-white hover:bg-white hover:text-primary"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              لوحة الإدارة
            </Link>
          )}

          <Link
            to="/portal"
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-accent/20 transition-all"
          >
            <LogIn className="w-4 h-4" />
            {user ? 'حسابي' : 'بوابة الطلاب'}
          </Link>

          {/* Mobile Toggle */}
          <button 
            className={cn(
              "md:hidden p-2 rounded-lg",
              scrolled ? "text-primary hover:bg-slate-100" : "text-white hover:bg-white/10"
            )}
            onClick={() => setIsOpen(!isOpen)}
            id="mobile-menu-toggle"
          >
            {isOpen ? <X /> : <Menu />}
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
            className="md:hidden bg-white border-b overflow-hidden shadow-xl"
            id="mobile-menu"
          >
            <div className="flex flex-col p-4 gap-4">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 bg-primary text-white p-3 rounded-xl font-bold"
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
                    "text-lg font-medium p-2 rounded-lg",
                    location.pathname === link.href ? "text-accent bg-accent/5" : "text-slate-600"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/portal"
                className="flex items-center justify-center gap-2 bg-accent text-white p-3 rounded-xl font-bold"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="w-5 h-5" />
                {user ? 'حسابي' : 'بوابة الطلاب'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
}
