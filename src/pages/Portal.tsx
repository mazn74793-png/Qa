import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle, logout, db, handleFirestoreError, OperationType, registerWithEmail, loginWithEmail, bookClass, submitExam } from '@/src/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDocFromServer,
  addDoc,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
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
  Clock,
  ClipboardCheck,
  Plus,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Portal() {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'exams' | 'grades' | 'materials' | 'bookings'>('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [activeExam, setActiveExam] = useState<any>(null);

  useEffect(() => {
    if (user) {
      // Explicitly check for admin email to ensure immediate access
      const isAdminEmail = user.email === 'motaem23y@gmail.com';
      
      const userDocRef = doc(db, 'users', user.uid);
      getDocFromServer(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(isAdminEmail ? { ...data, role: 'admin' } : data);
        } else if (isAdminEmail) {
          // If admin logs in for the first time and doc doesn't exist
          setUserData({ fullName: user.displayName || 'المدير', role: 'admin' });
        }
      });
    }
  }, [user]);

  const isAdmin = userData?.role === 'admin' || user?.email === 'motaem23y@gmail.com';

  if (loading) return (
    <div className="pt-32 pb-20 flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  useEffect(() => {
    (window as any).showAddExamModal = () => setShowAddExam(true);
    (window as any).showAddClassModal = () => setShowAddClass(true);
  }, []);

  if (!user) return <LoginView />;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="container mx-auto px-2 md:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Navigation - Mobile: Horizontal Scroll, Desktop: Sidebar */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-[32px] p-4 md:p-6 border border-slate-100 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="relative">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
                    alt={user.displayName || 'User'} 
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-slate-50"
                  />
                  {isAdmin && <div className="absolute -top-1 -right-1 bg-accent text-white p-1 rounded-lg border-2 border-white shadow-sm"><Shield className="w-2.5 h-2.5" /></div>}
                </div>
                <div className="text-right flex-1 min-w-0">
                  <h3 className="font-bold text-primary truncate leading-tight text-sm md:text-base">{(user as any).displayName || userData?.fullName || 'مستخدم النظام'}</h3>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-black">{isAdmin ? 'المدير العام للمنصة' : 'طالب النظام'}</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(user.uid);
                      }}
                      className="text-[8px] md:text-[9px] text-slate-400 font-mono opacity-60 flex items-center gap-1 hover:text-accent hover:opacity-100 transition-all group"
                      title="اضغط لنسخ الرقم التعريفي"
                    >
                      <span className="bg-slate-100 px-1 rounded uppercase">ID:</span>
                      <span className="truncate max-w-[60px] md:max-w-none">{user.uid}</span>
                      <span className="hidden group-hover:inline">📋</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs Wrapper - Enhanced for better spacing on mobile */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-hide -mx-2 px-2 lg:mx-0 lg:px-0">
                <TabButton 
                  active={activeTab === 'dashboard'} 
                  onClick={() => setActiveTab('dashboard')} 
                  icon={LayoutDashboard} 
                  label="الرئيسية" 
                />
                <TabButton 
                  active={activeTab === 'schedule'} 
                  onClick={() => setActiveTab('schedule')} 
                  icon={Calendar} 
                  label="الجداول" 
                />
                <TabButton 
                  active={activeTab === 'exams'} 
                  onClick={() => setActiveTab('exams')} 
                  icon={ClipboardCheck} 
                  label="الامتحانات" 
                />
                <TabButton 
                  active={activeTab === 'grades'} 
                  onClick={() => setActiveTab('grades')} 
                  icon={TrendingUp} 
                  label="نتائجي" 
                />
                {isAdmin && (
                  <TabButton 
                    active={activeTab === 'bookings'} 
                    onClick={() => setActiveTab('bookings')} 
                    icon={User} 
                    label="الحجوزات" 
                  />
                )}
                <TabButton 
                  active={activeTab === 'materials'} 
                  onClick={() => setActiveTab('materials')} 
                  icon={BookOpen} 
                  label="المذكرات" 
                />
              </div>

              <button 
                onClick={() => logout()}
                className="hidden lg:flex w-full mt-6 items-center gap-3 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
              >
                <LogOut className="w-5 h-5" />
                خروج من النظام
              </button>
            </div>
            
            {/* Mobile Logout Button */}
            <button 
              onClick={() => logout()}
              className="lg:hidden w-full mt-4 flex items-center justify-center gap-2 p-3 text-red-500 font-bold bg-white rounded-2xl border border-red-50 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </aside>

          <main className="lg:w-3/4">
            <AnimatePresence mode="wait">
              {activeExam ? (
                <ExamRunnerView exam={activeExam} onFinish={() => setActiveExam(null)} />
              ) : (
                <AnimatePresence mode="wait">
                  {activeTab === 'dashboard' && <DashboardView user={user} userData={{...userData, role: isAdmin ? 'admin' : userData?.role}} />}
                  {activeTab === 'schedule' && <ScheduleView isAdmin={isAdmin} onAdd={() => setShowAddClass(true)} />}
                  {activeTab === 'exams' && <ExamsView isAdmin={isAdmin} onTake={(exam: any) => setActiveExam(exam)} onAdd={() => setShowAddExam(true)} />}
                  {activeTab === 'grades' && <GradesView />}
                  {activeTab === 'materials' && <MaterialsView />}
                  {activeTab === 'bookings' && <BookingsView />}
                </AnimatePresence>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Admin Modals */}
        <AnimatePresence>
          {showAddClass && (
            <AddClassModal onClose={() => setShowAddClass(false)} />
          )}
          {showAddExam && (
            <AddExamModal onClose={() => setShowAddExam(false)} />
          )}
        </AnimatePresence>
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

function DashboardView({ user, userData }: { user: any, userData: any }) {
  const isAdmin = userData?.role === 'admin';
  const [stats, setStats] = useState({ students: 0, exams: 0, bookings: 0 });

  useEffect(() => {
    if (isAdmin) {
      const fetchStats = async () => {
        try {
          const uSnap = await getDocs(collection(db, 'users'));
          const eSnap = await getDocs(collection(db, 'exams'));
          const bSnap = await getDocs(collection(db, 'bookings'));
          setStats({
            students: uSnap.size,
            exams: eSnap.size,
            bookings: bSnap.size
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      };
      fetchStats();
    }
  }, [isAdmin]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 md:space-y-10 text-right pb-10"
    >
      {/* Hero Welcome - Enhanced for Legibility */}
      <div className={cn(
        "rounded-[32px] md:rounded-[48px] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl flex flex-col justify-center min-h-[220px] md:min-h-[300px]",
        isAdmin 
          ? "bg-gradient-to-br from-slate-900 via-primary to-primary/90 shadow-primary/20" 
          : "bg-gradient-to-br from-primary via-primary/95 to-accent/90 shadow-primary/10"
      )}>
        {/* Decorative elements that don't overlap text */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full blur-[140px] opacity-10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent rounded-full blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-5 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider border border-white/10">
            <Shield className="w-3.5 h-3.5 text-accent" />
            {isAdmin ? 'الإدارة المركزية' : 'بوابة الطالب الذكية'}
          </div>
          <h2 className="text-3xl md:text-6xl font-black mb-3 leading-tight tracking-tight">
            أهلاً بك، {((user as any).displayName || userData?.fullName || 'أستاذ').split(' ')[0]} 👋
          </h2>
          <p className="text-white/70 text-base md:text-xl max-w-2xl leading-relaxed font-medium">
            {isAdmin 
              ? 'لديك اليوم كامل الصلاحيات لإدارة المحتوى التعليمي، متابعة الطلاب، وتنظيم المواعيد.'
              : 'رحلتك التعليمية مستمرة اليوم. تفقد المهام المطلوبة منك وتابع تقدمك الدراسي.'}
          </p>
        </div>
      </div>

      {/* Admin Quick Tools - Cleaner Layout */}
      {isAdmin && (
        <div className="bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm flex flex-wrap gap-2 md:gap-4">
           <div className="text-[10px] font-black text-slate-400 px-6 py-4 flex items-center border-l border-slate-50">أدوات سريعة</div>
           <div className="flex flex-1 gap-2 md:gap-4 p-2">
             <button 
               onClick={() => (window as any).showAddExamModal()} 
               className="flex-1 flex items-center justify-center gap-2 bg-accent/5 hover:bg-accent text-accent hover:text-white p-4 rounded-2xl text-sm font-black transition-all shadow-sm hover:shadow-accent/20"
             >
               <ClipboardCheck className="w-5 h-5 shrink-0" />
               <span className="hidden sm:inline">إضافة امتحان</span>
             </button>
             <button 
               onClick={() => (window as any).showAddClassModal()} 
               className="flex-1 flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary text-primary hover:text-white p-4 rounded-2xl text-sm font-black transition-all shadow-sm hover:shadow-primary/20"
             >
               <Calendar className="w-5 h-5 shrink-0" />
               <span className="hidden sm:inline">إضافة حصة</span>
             </button>
           </div>
        </div>
      )}

      {/* Stats Grid - Fixed Overlapping with Responsive Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {isAdmin ? (
          <>
            <StatCard title="إجمالي الطلاب" value={stats.students} icon={User} color="bg-blue-600" desc="مسجلين حالياً" />
            <StatCard title="الامتحانات" value={stats.exams} icon={ClipboardCheck} color="bg-orange-500" desc="نشطة في النظام" />
            <StatCard title="حجوزات جديدة" value={stats.bookings} icon={Calendar} color="bg-green-600" desc="هذا الشهر" />
          </>
        ) : (
          <>
            <StatCard title="حصصك" value="3" icon={Calendar} color="bg-blue-500" desc="المستوى القادم" />
            <StatCard title="متوسط الدرجات" value="18/20" icon={TrendingUp} color="bg-green-500" desc="أداء متميز" />
            <StatCard title="مذكراتك" value="5" icon={BookOpen} color="bg-accent" desc="تم تحميلها" />
          </>
        )}
      </div>

      {!isAdmin && (
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
      )}
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

function ScheduleView({ isAdmin, onAdd }: { isAdmin: boolean, onAdd: () => void }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [userBookings, setUserBookings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'schedule'), orderBy('day'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'schedule');
    });

    if (auth.currentUser) {
      const bq = query(collection(db, 'bookings'), where('studentId', '==', auth.currentUser.uid));
      getDocs(bq).then(snap => {
        setUserBookings(snap.docs.map(d => d.data().slotId));
      });
    }

    return unsubscribe;
  }, []);

  const handleBook = async (slotId: string, courseId: string) => {
    try {
      setBookingId(slotId);
      await bookClass(slotId, courseId);
      setUserBookings([...userBookings, slotId]);
      alert('تم الحجز بنجاح!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setBookingId(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 text-right"
    >
      <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="text-right">
          <h3 className="text-xl font-black text-primary">جداول الحصص</h3>
          <p className="text-slate-500 text-xs mt-1">تصفح واحجز مكانك في المجموعات المتاحة</p>
        </div>
        {isAdmin ? (
          <button 
            onClick={onAdd}
            className="bg-accent text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-accent/20"
          >
            إضافة حصة <Plus className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
            <Calendar className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-slate-100" />)
        ) : slots.length > 0 ? (
          slots.map((slot) => {
            const isBooked = userBookings.includes(slot.id);
            return (
              <div key={slot.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">{slot.day}</span>
                  <div className="flex items-center gap-2">
                    {isBooked && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[8px] font-black">حجزت مؤخراً</span>}
                    <span className="text-slate-400 font-mono text-[10px]">{slot.time}</span>
                  </div>
                </div>
                <h4 className="text-lg font-black text-primary mb-1 uppercase tracking-tight">{slot.courseName || 'حصة تعليمية'}</h4>
                <p className="text-slate-500 text-xs mb-6 italic">المدرس: {slot.teacherName || 'مدرس المادة'}</p>
                
                {!isAdmin && (
                  <button 
                    onClick={() => handleBook(slot.id, slot.id)} // Using slot.id as courseId for simplicity
                    disabled={bookingId === slot.id || isBooked}
                    className={cn(
                      "w-full p-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                      isBooked 
                        ? "bg-green-50 text-green-600 cursor-not-allowed" 
                        : "bg-slate-50 hover:bg-primary hover:text-white"
                    )}
                  >
                    {bookingId === slot.id ? 'جاري الحجز...' : isBooked ? 'تم الحجز بالفعل' : 'احجز الآن'}
                    {!isBooked && <ChevronRight className="w-3 h-3 rotate-180" />}
                    {isBooked && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button className="flex-1 bg-slate-50 text-slate-400 p-2 rounded-xl text-[10px] hover:text-red-500 transition-colors">حذف الحصة</button>
                    <button className="flex-1 bg-slate-50 text-slate-400 p-2 rounded-xl text-[10px]">تعديل</button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">
            لا توجد حصص مجدولة حالياً
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ExamsView({ isAdmin, onAdd, onTake }: { isAdmin: boolean, onAdd: () => void, onTake: (exam: any) => void }) {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      const q = query(collection(db, 'bookings'), where('studentId', '==', auth.currentUser?.uid));
      getDocs(q).then(async (snap) => {
        const slotIds = snap.docs.map(d => d.data().slotId);
        if (slotIds.length > 0) {
          // Fetch teachers for these slots
          const teacherList: string[] = [];
          for (const sid of slotIds) {
            const sDoc = await getDocFromServer(doc(db, 'schedule', sid));
            if (sDoc.exists()) {
              teacherList.push(sDoc.data().teacherName);
            }
          }
          setBookings(teacherList);
        }
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    // Only fetch active exams for students
    const q = isAdmin 
      ? query(collection(db, 'exams'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'exams'), where('active', '==', true), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for student: only show exams for teachers they have booked with
      if (!isAdmin) {
        data = data.filter((exam: any) => {
          // If the exam isn't linked to a specific teacher, or if we have it in bookings
          if (!exam.teacherName) return true; 
          return bookings.includes(exam.teacherName);
        });
      }

      setExams(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'exams');
    });
    return unsubscribe;
  }, [isAdmin, bookings.join(',')]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="text-right">
          <h3 className="text-xl font-black text-primary">الامتحانات والتقييمات</h3>
          <p className="text-slate-500 text-xs mt-1">اختبر معلوماتك وتابع مستواك الدراسي</p>
        </div>
        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
          <ClipboardCheck className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />)
        ) : exams.length > 0 ? (
          exams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="text-right">
                <h4 className="font-black text-primary">{exam.title}</h4>
                <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-400 font-bold uppercase">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {exam.teacherName || 'الإدارة'}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.durationMinutes} دقيقة</span>
                </div>
              </div>
              <button 
                onClick={() => isAdmin ? null : onTake(exam)}
                className="bg-accent text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isAdmin ? 'تعديل' : 'بدء الامتحان'}
              </button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 font-bold italic bg-white rounded-[32px] border border-slate-100">
             لا يوجد امتحانات متاحة حالياً
          </div>
        )}
      </div>

      {isAdmin && (
        <button 
          onClick={onAdd}
          className="w-full bg-primary text-white p-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إنشاء امتحان جديد
        </button>
      )}
    </motion.div>
  );
}

function GradesView() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.currentUser) {
      const q = query(
        collection(db, 'submissions'), 
        where('studentId', '==', auth.currentUser.uid),
        orderBy('submittedAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }, (error) => {
        console.error("Error fetching submissions:", error);
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 text-right"
    >
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-primary">سجل الدرجات</h3>
        <p className="text-slate-500 text-xs mt-1">عرض جميع نتائج الاختبارات السابقة وتقييماتك</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-10 text-center animate-pulse">جاري جلب النتائج...</div>
        ) : submissions.length > 0 ? (
          submissions.map((sub) => (
            <div key={sub.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-50 text-green-600 px-4 py-2 rounded-2xl font-black text-lg">
                  {sub.score}/{sub.total}
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-primary">تم اجتياز الاختبار</h4>
                  <p className="text-[10px] text-slate-400">التاريخ: {(sub.submittedAt as any)?.toDate?.().toLocaleDateString('ar-EG') || 'حديثاً'}</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[40px] border border-slate-100 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="text-slate-200 w-8 h-8" />
             </div>
             <p className="text-slate-400 font-bold italic">لم تخضع لأي اختبارات بعد</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ExamRunnerView({ exam, onFinish }: { exam: any, onFinish: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ score: number, total: number } | null>(null);

  const questions = exam.questions || [];

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      let score = 0;
      questions.forEach((q: any, idx: number) => {
        if (answers[idx] === q.correct) score++;
      });
      await submitExam(exam.id, answers, score, questions.length);
      setResults({ score, total: questions.length });
    } catch (error) {
      alert('خطأ في إرسال الإجابات');
    } finally {
      setSubmitting(false);
    }
  };

  if (results) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl text-center"
      >
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClipboardCheck className="text-green-500 w-10 h-10" />
        </div>
        <h3 className="text-3xl font-black text-primary mb-2">تهانينا! اكتمل الاختبار</h3>
        <p className="text-slate-500 mb-8">درجتك النهائية: <span className="text-accent font-black">{results.score}</span> من <span className="text-primary font-black">{results.total}</span></p>
        
        {exam.solutionVideoUrl && (
          <div className="mb-8 space-y-4">
             <div className="flex items-center gap-2 justify-center text-primary font-bold">
               <BookOpen className="w-5 h-5 text-accent" />
               شاهد فيديو حل الامتحان والتعليق على الأخطاء
             </div>
             <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                <iframe 
                  src={exam.solutionVideoUrl.replace('watch?v=', 'embed/').split('&')[0]} 
                  className="w-full h-full"
                  allowFullScreen
                />
             </div>
          </div>
        )}

        <button 
          onClick={onFinish}
          className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          العودة للرئيسية
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl"
    >
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
        <button onClick={onFinish} className="text-slate-400 hover:text-red-500 font-bold text-sm">انسحاب</button>
        <div className="text-right">
          <h3 className="text-xl font-black text-primary">{exam.title}</h3>
          <p className="text-slate-400 text-xs">سؤال {currentStep + 1} من {questions.length}</p>
        </div>
      </div>

      <div className="mb-12 text-right">
        {questions.length > 0 && (
          <>
            <h4 className="text-2xl font-bold text-primary mb-8">{questions[currentStep].q}</h4>
            <div className="grid grid-cols-1 gap-3">
              {questions[currentStep].options.map((opt: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setAnswers({...answers, [currentStep]: idx})}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 text-right font-bold transition-all",
                    answers[currentStep] === idx 
                      ? "border-accent bg-accent/5 text-accent shadow-md shadow-accent/10" 
                      : "border-slate-50 bg-slate-50 hover:border-slate-200 text-slate-600"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      answers[currentStep] === idx ? "border-accent bg-accent" : "border-slate-300"
                    )}>
                      {answers[currentStep] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        {currentStep < questions.length - 1 ? (
          <button 
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={answers[currentStep] === undefined}
            className="flex-1 bg-primary text-white p-4 rounded-2xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
          >
            السؤال التالي
          </button>
        ) : (
          <button 
            onClick={handleFinish}
            disabled={submitting || answers[currentStep] === undefined}
            className="flex-1 bg-green-600 text-white p-4 rounded-2xl font-bold shadow-lg shadow-green-600/20 disabled:opacity-50 transition-all"
          >
            {submitting ? 'جاري الإرسال...' : 'إنهاء وإرسال'}
          </button>
        )}
        {currentStep > 0 && (
          <button 
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-8 bg-slate-100 text-slate-600 p-4 rounded-2xl font-bold"
          >
            سابق
          </button>
        )}
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

// Admin Creation Modals
function AddClassModal({ onClose }: { onClose: () => void }) {
  const [day, setDay] = useState('السبت');
  const [time, setTime] = useState('');
  const [courseName, setCourseName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'schedule'), {
        day,
        time,
        courseName,
        teacherName,
        createdAt: serverTimestamp()
      });
      alert('تم إضافة الحصة بنجاح');
      onClose();
    } catch (err) {
      alert('خطأ في إضافة الحصة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[40px] w-full max-w-lg p-8 relative overflow-hidden text-right"
      >
        <button onClick={onClose} className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
        
        <h3 className="text-2xl font-black text-primary mb-6 flex items-center gap-2 justify-end">
          إضافة حصة جديدة
          <Calendar className="text-accent" />
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block mr-1">الوقت</label>
              <input 
                type="text" placeholder="مثلاً 10:00 صباحاً" 
                value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block mr-1">اليوم</label>
              <select 
                value={day} onChange={(e) => setDay(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-right"
              >
                {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block mr-1">اسم المادة / المجموعة</label>
            <input 
              type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1 block mr-1">اسم المدرس</label>
            <input 
              type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" required
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full bg-accent text-white p-4 rounded-xl font-black shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
          >
            {loading ? 'جاري الحفظ...' : 'تأكيد الإضافة'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function BookingsView() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async (d) => {
        const bookingData = d.data() as any;
        const booking = { id: d.id, ...bookingData };
        // Fetch student name
        try {
          const uDoc = await getDocFromServer(doc(db, 'users', bookingData.studentId));
          return { ...booking, studentName: uDoc.exists() ? uDoc.data().fullName : 'طالب غير مسجل' };
        } catch {
          return { ...booking, studentName: 'خطأ في التحميل' };
        }
      }));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    });
    return unsubscribe;
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="space-y-6 text-right"
    >
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-primary">سجل الحجوزات</h3>
        <p className="text-slate-500 text-xs mt-1">تتبع كافة الطلاب الذين قامو بالتسجيل في الحصص المختلفة</p>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[600px]">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black">
              <tr>
                <th className="p-4">اسم الطالب</th>
                <th className="p-4">الحصة / الكورس</th>
                <th className="p-4">رقم الطالب الفريد</th>
                <th className="p-4">تاريخ الحجز</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={4} className="p-10 text-center animate-pulse font-bold text-slate-300">جاري تحميل سجلات الحجز...</td></tr>
              ) : bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-black text-primary">{b.studentName}</td>
                    <td className="p-4 font-bold text-accent">{b.slotId}</td>
                    <td className="p-4 font-mono text-[9px] text-slate-400">{b.studentId}</td>
                    <td className="p-4 text-slate-500">{(b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().toLocaleString('ar-EG') : 'قيد المعالجة'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="p-20 text-center text-slate-200 font-black italic">لا توجد حجوزات حتى اللحظة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function AddExamModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [duration, setDuration] = useState('60');
  const [videoUrl, setVideoUrl] = useState('');
  const [questions, setQuestions] = useState<any[]>([{ q: '', options: ['', '', '', ''], correct: 0 }]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => setQuestions([...questions, { q: '', options: ['', '', '', ''], correct: 0 }]);
  const updateQuestion = (idx: number, field: string, value: any) => {
    const newQs = [...questions];
    newQs[idx][field] = value;
    setQuestions(newQs);
  };
  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const newQs = [...questions];
    newQs[qIdx].options[oIdx] = value;
    setQuestions(newQs);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'exams'), {
        title,
        teacherName,
        durationMinutes: parseInt(duration),
        questions,
        solutionVideoUrl: videoUrl,
        createdAt: serverTimestamp(),
        active: true
      });
      alert('تم إنشاء الامتحان بنجاح!');
      onClose();
    } catch (err) {
      alert('خطأ في إنشاء الامتحان');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[40px] w-full max-w-2xl p-8 relative overflow-hidden text-right my-8"
      >
        <button onClick={onClose} className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
        
        <h3 className="text-2xl font-black text-primary mb-6 flex items-center gap-2 justify-end">
          إنشاء امتحان جديد متكامل
          <ClipboardCheck className="text-accent" />
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block mr-1">عنوان الامتحان</label>
              <input 
                type="text" placeholder="مثلاً: اختبار الفيزياء - الفصل الأول" 
                value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block mr-1">المدرس المسؤول</label>
              <input 
                type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block mr-1">مدة الامتحان (بالدقائق)</label>
              <input 
                type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block mr-1">رابط فيديو الحل (YouTube/Vimeo)</label>
              <input 
                type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/..."
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-right"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <button type="button" onClick={addQuestion} className="text-accent text-xs font-bold flex items-center gap-1 hover:underline">
                 <Plus className="w-3 h-3" /> إضافة سؤال آخر
               </button>
               <h4 className="text-sm font-black text-primary">الأسئلة ({questions.length})</h4>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                  <input 
                    type="text" placeholder={`السؤال رقم ${qIdx + 1}`}
                    value={q.q} onChange={(e) => updateQuestion(qIdx, 'q', e.target.value)}
                    className="w-full bg-white border-none rounded-xl p-3 text-right text-sm font-bold" required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt: string, oIdx: number) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input 
                          type="radio" name={`q-${qIdx}`} checked={q.correct === oIdx}
                          onChange={() => updateQuestion(qIdx, 'correct', oIdx)}
                        />
                        <input 
                          type="text" placeholder={`الخيار ${oIdx + 1}`}
                          value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                          className="flex-1 bg-white border-none rounded-lg p-2 text-right" required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-primary text-white p-4 rounded-xl font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? 'جاري الإنشاء...' : 'نشر الامتحان للطلاب'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
