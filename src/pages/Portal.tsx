import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle, logout, db, handleFirestoreError, OperationType, registerWithEmail, loginWithEmail } from '@/src/lib/firebase';
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
  LogIn,
  UserPlus,
  Clock
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
                  <h3 className="font-bold text-primary truncate leading-tight">{(user as any).displayName || (user as any).fullName || 'طالب متميز'}</h3>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-slate-500 font-bold">طالب النظام</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(user.uid);
                      }}
                      className="text-[9px] text-slate-400 font-mono opacity-60 flex items-center gap-1 hover:text-accent hover:opacity-100 transition-all group"
                      title="اضغط لنسخ الرقم التعريفي"
                    >
                      <span className="bg-slate-100 px-1 rounded uppercase">ID:</span>
                      <span className="truncate max-w-[80px]">{user.uid}</span>
                      <span className="hidden group-hover:inline">📋</span>
                    </button>
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
              {activeTab === 'schedule' && <ScheduleView />}
              {activeTab === 'grades' && <GradesView />}
              {activeTab === 'materials' && <MaterialsView />}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function LoginView() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [studentAction, setStudentAction] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError('خطأ في بيانات الإدارة. يرجى التأكد من البريد وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (studentAction === 'register') {
        if (!name) throw new Error('يرجى كتابة الاسم');
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.message.includes('email-already-in-use')) {
        setError('هذا البريد مسجل مسبقاً، جرب تسجيل الدخول.');
      } else if (err.message.includes('wrong-password') || err.message.includes('user-not-found')) {
        setError('بيانات الدخول غير صحيحة.');
      } else {
        setError(err.message || 'حدث خطأ غير متوقع.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        {/* Toggle Mode */}
        <div className="flex bg-slate-200 p-1 rounded-2xl mb-6 shadow-inner">
           <button 
             onClick={() => { setMode('student'); setError(''); }}
             className={cn(
               "flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
               mode === 'student' ? "bg-white text-primary shadow-sm" : "text-slate-500"
             )}
           >
             <User className="w-4 h-4" />
             بوابة الطالب
           </button>
           <button 
             onClick={() => { setMode('admin'); setError(''); }}
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
          key={mode + studentAction}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 text-center border border-slate-100"
        >
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GraduationCap className={cn("w-8 h-8", mode === 'student' ? "text-primary" : "text-accent")} />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
             {mode === 'student' 
               ? (studentAction === 'login' ? 'دخول الطلاب' : 'حساب جديد للطالب') 
               : 'دخول المدرسين والإدارة'}
          </h2>
          <p className="text-slate-500 mb-8 text-sm">
            {mode === 'student' 
              ? (studentAction === 'login' ? 'ادخل بياناتك لمتابعة مذكراتك ومواعيدك.' : 'سجل بياناتك للانضمام للمركز والاستفادة من خدماتنا.')
              : 'سجل دخولك بصفتك مسؤولاً للتحكم في محتوى المركز.'}
          </p>
          
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-6 border border-red-100 text-right">{error}</div>}

          {mode === 'student' ? (
            <div className="space-y-6">
              <form onSubmit={handleStudentAuth} className="space-y-4 text-right">
                {studentAction === 'register' && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block mr-1">اسم الطالب الرباعي</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl p-4 text-right focus:ring-2 focus:ring-primary/20"
                      placeholder="احمد محمد علي محمود"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block mr-1">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-right focus:ring-2 focus:ring-primary/20"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block mr-1">كلمة المرور</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-right focus:ring-2 focus:ring-primary/20"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white p-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'جاري التحميل...' : (studentAction === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب')}
                  {!loading && (studentAction === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold">أو عن طريق</span></div>
              </div>

              <button 
                onClick={() => loginWithGoogle()}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-accent p-4 rounded-2xl font-bold text-slate-700 transition-all hover:bg-slate-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                الدخول السريع باستخدام جوجل
              </button>

              <button 
                onClick={() => setStudentAction(studentAction === 'login' ? 'register' : 'login')}
                className="text-accent font-bold text-sm hover:underline"
              >
                {studentAction === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4 text-right">
              <div>
                 <label className="text-xs font-bold text-slate-500 mb-1 block mr-1">البريد الإلكتروني (الإدارة)</label>
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-slate-50 border-none rounded-xl p-4 text-right focus:ring-2 focus:ring-accent/20"
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
                   className="w-full bg-slate-50 border-none rounded-xl p-4 text-right focus:ring-2 focus:ring-accent/20"
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Hero Welcome */}
      <div className="bg-primary rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-[80px] opacity-10 translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-6">
            <Clock className="w-3.5 h-3.5 text-accent" />
            آخر حصة: السبت القادم 10:00 ص
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">أهلاً بك يا {((user as any).displayName || (user as any).fullName || '').split(' ')[0]} 👋</h2>
          <p className="text-white/60 text-lg md:text-xl max-w-xl leading-relaxed">نتمنى لك رحلة ممتعة ومثمرة اليوم في منصتك التعليمية المتكاملة.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard title="الحصص القادمة" value="3" icon={Calendar} color="bg-blue-500" desc="لهذا الأسبوع" />
        <StatCard title="الدرجات" value="18/20" icon={TrendingUp} color="bg-green-500" desc="آخر اختبار" />
        <StatCard title="المذكرات" value="5" icon={BookOpen} color="bg-accent" desc="تحميلات متبقية" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/20">
          <h3 className="text-xl font-black text-primary mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="text-accent w-5 h-5" />
              تنبيهات هامة
            </span>
            <span className="text-xs bg-red-50 text-red-500 px-2.5 py-1 rounded-full">جديد</span>
          </h3>
          <div className="space-y-6">
            <ActivityItem 
              title="امتحان الفيزياء الدوري" 
              desc="السبت القادم 10 ص - قاعة 1" 
              type="alert" 
              color="text-orange-500"
            />
            <ActivityItem 
              title="مذكرة البلاغة الجديدة" 
              desc="تم رفع الجزء الثالث الآن" 
              type="file" 
              color="text-blue-500"
            />
            <ActivityItem 
              title="تقييم الشهر الماضي" 
              desc="درجتك 19/20 - ممتاز!" 
              type="exam" 
              color="text-green-500"
            />
          </div>
        </div>

        {/* Quick Links / Next Step */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-primary mb-4 italic">ماذا تريد أن تنجز الآن؟</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">يمكنك البدء بمراجعة آخر حصة مسجلة أو تحميل مذكرات الأسبوع الجديد.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <button className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-3xl hover:border-accent hover:shadow-lg transition-all group">
                <BookOpen className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-primary uppercase">المذكرات</span>
             </button>
             <button className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-3xl hover:border-primary hover:shadow-lg transition-all group">
                <Calendar className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black text-primary uppercase">الأيام</span>
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon: Icon, color, desc }: any) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-sm hover:translate-y-[-5px] transition-all group">
      <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-current/20", color)}>
        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </div>
      <div className="text-right">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-primary">{value}</p>
        <p className="text-[9px] text-slate-300 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function ActivityItem({ title, desc, color }: any) {
  return (
    <div className="flex items-start gap-4 group cursor-pointer">
      <div className={cn("mt-1.5 w-2 h-2 rounded-full", color.replace('text-', 'bg-'))} />
      <div className="flex-1">
        <h4 className="text-primary font-bold text-sm mb-0.5 group-hover:text-accent transition-colors">{title}</h4>
        <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 rotate-180 self-center group-hover:translate-x-[-3px] transition-transform" />
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

function ScheduleView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 text-center shadow-sm"
    >
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Calendar className="text-blue-500 w-10 h-10" />
      </div>
      <h3 className="text-xl font-black text-primary mb-2">جدول الحصص الأسبوعي</h3>
      <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed mb-8">
        لا يوجد حصص مسجلة في جدولك حالياً. تأكد من إتمام اشتراكك في المجموعات الدراسية.
      </p>
      <div className="space-y-3 max-w-md mx-auto">
        {['السبت', 'الأحد', 'الاثنين'].map((day) => (
          <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl opacity-40">
            <span className="font-bold text-slate-400">{day}</span>
            <span className="text-xs text-slate-300 italic">لا يوجد محاضرات</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function GradesView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 text-center shadow-sm"
    >
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <TrendingUp className="text-green-500 w-10 h-10" />
      </div>
      <h3 className="text-xl font-black text-primary mb-2">سجل الدرجات والتقييم</h3>
      <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed mb-8">
        درجاتك في الامتحانات الدورية والتقييمات الشهرية ستظهر هنا فور تصحيحها.
      </p>
      <div className="p-8 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-300 font-bold italic text-sm">
        قريباً: عرض بياني لمستواك الدراسي
      </div>
    </motion.div>
  );
}

function MaterialsView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 text-center shadow-sm"
    >
      <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen className="text-accent w-10 h-10" />
      </div>
      <h3 className="text-xl font-black text-primary mb-2">المكتبة والمذكرات</h3>
      <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed mb-8">
        بإمكانك تحميل مذكرات الحصص والملخصات بتنسيق PDF من هذا القسم.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
        {[1, 2].map((i) => (
          <div key={i} className="p-5 border border-slate-50 bg-slate-50/50 rounded-2xl opacity-40 grayscale">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <FileText className="w-6 h-6 text-slate-300" />
              </div>
              <div className="flex-1">
                <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                <div className="h-2 w-12 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
