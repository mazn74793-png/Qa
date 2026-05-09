import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useState } from 'react';
import { cn } from './lib/utils';

// Lazy loading components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Courses = lazy(() => import('./pages/Courses'));
const Teachers = lazy(() => import('./pages/Teachers'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Contact = lazy(() => import('./pages/Contact'));
const Portal = lazy(() => import('./pages/Portal'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-accent rounded-full animate-spin"></div>
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

export default function App() {
  const [settings, setSettings] = useState<any>(null);
  
  useEffect(() => {
    import('@/src/services/siteService').then(service => {
      service.getSiteSettings().then(setSettings);
    });
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <LayoutWrapper>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </LayoutWrapper>
    </Router>
  );
}
