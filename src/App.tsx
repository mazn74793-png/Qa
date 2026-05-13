import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useState } from 'react';
import { cn } from './lib/utils';

import Home from './pages/Home';

// Lazy loading other components
const About = lazy(() => import('./pages/About'));
const Courses = lazy(() => import('./pages/Courses'));
const Teachers = lazy(() => import('./pages/Teachers'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Contact = lazy(() => import('./pages/Contact'));
const Portal = lazy(() => import('./pages/Portal'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

function PageLoader() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-slate-100 border-t-accent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">انتظر قليلاً</p>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {!isAdminPath && <Navbar />}
      <main className={cn(
        "flex-grow",
        !isHomePage && !isAdminPath && "pt-20 md:pt-28 lg:pt-32"
      )}>
        {children}
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
}

import { AnimatePresence, motion } from 'motion/react';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "circOut" }}
          >
            <Home />
          </motion.div>
        } />
        <Route path="/about" element={
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "circOut" }}
          >
            <About />
          </motion.div>
        } />
        <Route path="/courses" element={
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "circOut" }}
          >
            <Courses />
          </motion.div>
        } />
        <Route path="/teachers" element={
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "circOut" }}
          >
            <Teachers />
          </motion.div>
        } />
        <Route path="/schedule" element={
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "circOut" }}
          >
            <Schedule />
          </motion.div>
        } />
        <Route path="/contact" element={
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "circOut" }}
          >
            <Contact />
          </motion.div>
        } />
        <Route path="/portal" element={
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Portal />
          </motion.div>
        } />
        <Route path="/admin" element={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminDashboard />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [settings, setSettings] = useState<any>(null);
  
  useEffect(() => {
    // Faster settings fetch
    const fetchSettings = async () => {
      try {
        const service = await import('@/src/services/siteService');
        const siteSettings = await service.getSiteSettings();
        setSettings(siteSettings);
      } finally {
        // Ensuring the app-ready signal is sent as soon as basic init is done
        // Small delay to ensure rendering is committed
        requestAnimationFrame(() => {
          setTimeout(() => {
            document.body.classList.add('app-ready');
          }, 50);
        });
      }
    };
    
    fetchSettings();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <LayoutWrapper>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </LayoutWrapper>
    </Router>
  );
}
