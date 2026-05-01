import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle, logout, db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  User, 
  LogOut, 
  GraduationCap,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Shield,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Portal() {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'grades' | 'materials'>('dashboard');

  if (loading) return (
    <div className="pt-32 pb-20 flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  if (!user) return <LoginView />;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Navigation - Mobile: Horizontal Scroll, Desktop: Sidebar */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-[32px] p-4 md:p-6 border border-slate-100 shadow-sm lg:sticky lg:top-32">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                  alt={user.displayName || 'User'} 
                  className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover"
                />
                <div className="text-right flex-1 min-w-0">
                  <h3 className="font-bold text-primary truncate">{user.displayName}</h3>
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-500">طالب</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1 opacity-60 flex items-center gap-1">
                      <span>UID:</span>
                      <span className="select-all cursor-copy truncate">{user.uid}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs Wrapper */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide -mx-2 px-2 lg:mx-0 lg:px-0">
                <TabButton 
                  active={activeTab === 'dashboard'} 
                  onClick={() => setActiveTab('dashboard')} 
                  icon={LayoutDashboard} 
                  label="لوحة التحكم" 
                />
                <TabButton 
                  active={activeTab === 'schedule'} 
                  onClick={() => setActiveTab('schedule')} 
                  icon={Calendar} 
                  label="جداولي" 
                />
                <TabButton 
                  active={activeTab === 'grades'} 
                  onClick={() => setActiveTab('grades')} 
                  icon={TrendingUp} 
                  label="الدرجات" 
                />
                <TabButton 
                  active={activeTab === 'materials'} 
                  onClick={() => setActiveTab('materials')} 
                  icon={BookOpen} 
                  label="المذكرات" 
                />
              </div>

              <button 
                onClick={() => logout()}
                className="hidden lg:flex w-full mt-8 items-center gap-3 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>
            
            {/* Mobile Logout Button */}
            <button 
              onClick={() => logout()}
              className="lg:hidden w-full mt-4 flex items-center justify-center gap-2 p-4 text-red-500 font-bold bg-white rounded-2xl border border-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <DashboardView user={user} />}
              {activeTab === 'schedule' && <SchedulePlaceholder />}
              {activeTab === 'grades' && <GradesPlaceholder />}
              {activeTab === 'materials' && <MaterialsPlaceholder />}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function LoginView() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success will trigger useAuthState which will re-render Portal
    } catch (err: any) {
      setError('خطأ في بيانات الدخول. يرجى التأكد من الإيميل والباسورد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        {/* Toggle Mode */}
        <div className="flex bg-slate-200 p-1 rounded-2xl mb-6">
           <button 
             onClick={() => setMode('student')}
             className={cn(
               "flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
               mode === 'student' ? "bg-white text-primary shadow-sm" : "text-slate-500"
             )}
           >
             <User className="w-4 h-4" />
             بوابة الطالب
           </button>
           <button 
             onClick={() => setMode('admin')}
             className={cn(
               "flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
               mode === 'admin' ? "bg-white text-accent shadow-sm" : "text-slate-500"
             )}
           >
             <Shield className="w-4 h-4" />
             الإدارة
           </button>
        </div>

        <motion.div 
          key={mode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 text-center border border-slate-100"
        >
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className={cn("w-8 h-8", mode === 'student' ? "text-primary" : "text-accent")} />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
             {mode === 'student' ? 'بوابة الطلاب' : 'دخول المدرسين والإدارة'}
          </h2>
          <p className="text-slate-500 mb-8 text-sm">
            {mode === 'student' 
              ? 'سجل دخولك لمتابعة حصصك ومذكراتك القادمة.' 
              : 'سجل دخولك بصفتك مسؤولاً للتحكم في محتوى المركز.'}
          </p>
          
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-4 border border-red-100">{error}</div>}

          {mode === 'student' ? (
            <button 
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-accent p-4 rounded-2xl font-bold text-slate-700 transition-all hover:bg-slate-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              الدخول باستخدام جوجل
            </button>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4 text-right">
              <div>
                 <label className="text-xs font-bold text-slate-500 mb-1 block mr-1">البريد الإلكتروني</label>
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-slate-50 border-none rounded-xl p-4 text-right focus:ring-2 focus:ring-accent"
                   placeholder="admin@qa.com"
                   required
                 />
              </div>
              <div>
                 <label className="text-xs font-bold text-slate-500 mb-1 block mr-1">كلمة المرور</label>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-slate-50 border-none rounded-xl p-4 text-right focus:ring-2 focus:ring-accent"
                   placeholder="••••••••"
                   required
                 />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-accent text-white p-4 rounded-xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'جاري التحقق...' : 'دخول النظام'}
                {!loading && <LogIn className="w-4 h-4" />}
              </button>
            </form>
          )}

          <p className="mt-8 text-[10px] text-slate-400">
            نظام QA التعليمي © 2024 - جميع الحقوق محفوظة
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function DashboardView({ user }: { user: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-8"
    >
      <div className="bg-primary rounded-[32px] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">أهلاً بك، {user.displayName?.split(' ')[0]}! 👋</h2>
          <p className="text-white/60 text-lg">نتمنى لك يوماً دراسياً موفقاً ومليئاً بالإنجازات.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="الحصص القادمة" value="3" icon={Calendar} color="bg-blue-500" />
        <StatCard title="آخر نتيجة" value="18/20" icon={TrendingUp} color="bg-green-500" />
        <StatCard title="المذكرات الجديدة" value="5" icon={BookOpen} color="bg-accent" />
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
          <AlertCircle className="text-accent" />
          تنبيهات هامة
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border-r-4 border-orange-400 rounded-xl">
            <p className="font-bold text-primary mb-1">امتحان الفيزياء الدوري</p>
            <p className="text-sm text-slate-600 font-medium">يوم السبت القادم الساعة 10 صباحاً في قاعة 1. يرجى الحضور مبكراً.</p>
          </div>
          <div className="p-4 bg-blue-50 border-r-4 border-blue-400 rounded-xl">
            <p className="font-bold text-primary mb-1">رفع مذكرة البلاغة الجديدة</p>
            <p className="text-sm text-slate-600 font-medium">تمت إضافة الجزء الثالث من مذكرة البلاغة بقسم المذكرات والتحميلات.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-6">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white", color)}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-shrink-0 items-center gap-2 px-6 lg:px-4 py-3 lg:py-4 rounded-2xl font-bold transition-all whitespace-nowrap",
        active 
          ? "bg-accent text-white shadow-lg shadow-accent/20" 
          : "text-slate-600 hover:bg-slate-50"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {active && <ChevronRight className="hidden lg:block w-4 h-4 rotate-180" />}
    </button>
  );
}

// Simple Placeholders
function SchedulePlaceholder() { return <PlaceholderView title="جدول حصصي" desc="قائمة بحصصك المسجلة والمواعيد القادمة." />; }
function GradesPlaceholder() { return <PlaceholderView title="الدرجات والنتائج" desc="تحليل لمستواك الدراسي ودرجات الامتحانات الدورية." />; }
function MaterialsPlaceholder() { return <PlaceholderView title="المذكرات والمحاضرات" desc="تحميل ملفات الـ PDF والروابط التعليمية الخاصة بموادك." />; }

function PlaceholderView({ title, desc }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-sm"
    >
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <FileText className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-2xl font-bold text-primary mb-3">{title}</h3>
      <p className="text-slate-500 mb-8">{desc}</p>
      <div className="max-w-md mx-auto p-6 bg-slate-50 rounded-2xl text-slate-400 text-sm italic">
        "هذا القسم سيتم ربطه بالبيانات الحقيقية لقاعدة البيانات بمجرد اكتمال تسجيلك في الدورات التدريبية المتاحة بالمركز."
      </div>
    </motion.div>
  );
}
