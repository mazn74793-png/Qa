import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Teachers from './pages/Teachers';
import Schedule from './pages/Schedule';
import Contact from './pages/Contact';
import Portal from './pages/Portal';
import AdminDashboard from './pages/admin/Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

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
  return (
    <Router>
      <ScrollToTop />
      <LayoutWrapper>
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
      </LayoutWrapper>
    </Router>
  );
}
