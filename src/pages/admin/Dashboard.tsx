import { useState, useEffect } from 'react';
import { useAdmin } from '@/src/hooks/useAdmin';
import { useSearchParams } from 'react-router-dom';
import { 
  BarChart3, 
  Settings2, 
  Users, 
  BookOpen, 
  Calendar, 
  LogOut, 
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  ClipboardCheck,
  TrendingUp,
  Plus,
  Edit3,
  Video,
  Eye,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { auth, db, logout, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import SiteEditor from './SiteEditor';
import CourseManager from './CourseManager';
import TeacherManager from './TeacherManager';
import ScheduleManager from './ScheduleManager';
import AdminManager from './AdminManager';
import ExamManager from './ExamManager';
import BookingManager from './BookingManager';
import VideoManager from './VideoManager';
import MaterialManager from './MaterialManager';
import StudentManager from './StudentManager';

type AdminTab = 'overview' | 'content' | 'courses' | 'teachers' | 'schedule' | 'exams' | 'bookings' | 'videos' | 'materials' | 'admins' | 'students';

export default function AdminDashboard() {
  const { isAdmin, loading, user } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as AdminTab) || 'overview';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as AdminTab;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  if (!isAdmin) return <AdminAccessDenied />;

  const handleLogout = async () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      await logout();
      window.location.href = '/';
    }
  };

  return (
    <div id="admin-panel" className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-primary text-white p-6 md:min-h-screen sticky top-0 z-50 flex flex-col">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10 shrink-0">
          <div className="bg-accent p-2 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <h2 className="font-bold">لوحة الإدارة</h2>
            <p className="text-xs text-white/50">QA Education System</p>
          </div>
        </div>

        <nav className="space-y-1 overflow-y-auto scrollbar-hide flex-1">
          <SidebarLink active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} icon={LayoutDashboard} label="نظرة عامة" />
          <SidebarLink active={activeTab === 'content'} onClick={() => handleTabChange('content')} icon={Settings2} label="محتوى الموقع" />
          <SidebarLink active={activeTab === 'courses'} onClick={() => handleTabChange('courses')} icon={BookOpen} label="إدارة المواد" />
          <SidebarLink active={activeTab === 'students'} onClick={() => handleTabChange('students')} icon={Users} label="إدارة الطلاب" />
          <SidebarLink active={activeTab === 'teachers'} onClick={() => handleTabChange('teachers')} icon={Users} label="إدارة المدرسين" />
          <SidebarLink active={activeTab === 'schedule'} onClick={() => handleTabChange('schedule')} icon={Calendar} label="إدارة الجدول" />
          <SidebarLink active={activeTab === 'videos'} onClick={() => handleTabChange('videos')} icon={Video} label="إدارة الفيديوهات" />
          <SidebarLink active={activeTab === 'materials'} onClick={() => handleTabChange('materials')} icon={BookOpen} label="إدارة الملازم" />
          <SidebarLink active={activeTab === 'exams'} onClick={() => handleTabChange('exams')} icon={ClipboardCheck} label="إدارة الامتحانات" />
          <SidebarLink active={activeTab === 'bookings'} onClick={() => handleTabChange('bookings')} icon={TrendingUp} label="سجل الحجوزات" />
          <SidebarLink active={activeTab === 'admins'} onClick={() => handleTabChange('admins')} icon={ShieldCheck} label="إدارة المسؤولين" />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 shrink-0">
          <div className="bg-white/5 p-4 rounded-2xl mb-4">
            <p className="text-xs text-white/40 mb-1">المسؤول الحالي</p>
            <p className="text-sm font-bold truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-red-100 bg-red-500/10 hover:bg-red-500/20 p-4 rounded-2xl font-bold transition-all"
          >
            <LogOut className="w-5 h-5" />
            خروج من النظام
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-4 md:p-10 pt-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary mb-2">أهلاً بك في غرفة القيادة 🚀</h1>
            <p className="text-slate-500 font-bold">كل التغييرات التي تجريها تظهر فوراً لجميع الطلاب.</p>
          </div>
          <div className="flex items-center gap-3">
             <Link 
               to="/portal"
               className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all font-black text-primary text-sm shadow-sm"
             >
                <Eye className="w-5 h-5 text-accent" />
                مشاهدة كطالب
             </Link>
             <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-black text-slate-600">النظام متصل وبانتظارك</span>
             </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'content' && <SiteEditor />}
          {activeTab === 'courses' && <CourseManager />}
          {activeTab === 'teachers' && <TeacherManager />}
          {activeTab === 'schedule' && <ScheduleManager />}
          {activeTab === 'videos' && <VideoManager />}
          {activeTab === 'materials' && <MaterialManager />}
          {activeTab === 'exams' && <ExamManager />}
          {activeTab === 'bookings' && <BookingManager />}
          {activeTab === 'students' && <StudentManager />}
          {activeTab === 'admins' && <AdminManager />}
        </div>
      </main>
    </div>
  );
}

function OverviewView() {
  const [stats, setStats] = useState({ students: 0, exams: 0, bookings: 0 });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const u = await getDocs(collection(db, 'users'));
      const e = await getDocs(collection(db, 'exams'));
      const b = await getDocs(collection(db, 'bookings'));
      setStats({
        students: u.size,
        exams: e.size,
        bookings: b.size
      });
    };
    
    // Fetch real recent activities (last 5 users)
    const activitiesQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribeUsers = onSnapshot(activitiesQuery, (snap) => {
      const userActs = snap.docs.map(doc => ({
        id: doc.id,
        type: 'user',
        title: `طالب جديد: ${doc.data().fullName || doc.data().email}`,
        time: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
        icon: Users
      }));
      setActivities(userActs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    fetchStats();
    return () => unsubscribeUsers();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox label="إجمالي الطلاب" value={stats.students} delta="+12%" icon={Users} color="bg-blue-600" />
        <StatBox label="الامتحانات المنشورة" value={stats.exams} delta="+5%" icon={ClipboardCheck} color="bg-accent" />
        <StatBox label="إجمالي الحجوزات" value={stats.bookings} delta="+20%" icon={TrendingUp} color="bg-green-600" />
      </div>
      
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
         <h3 className="text-xl font-black text-primary mb-8 border-b border-slate-50 pb-4 flex items-center gap-3">
           <BarChart3 className="text-accent" />
           آخر النشاطات في المنصة
         </h3>
         <div className="space-y-4">
            {activities.length > 0 ? activities.map((act, i) => (
              <div key={act.id} className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 rounded-3xl transition-all border border-transparent hover:border-slate-100">
                 <div className="flex items-center gap-5 text-right">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm">
                       <act.icon className="w-6 h-6"/>
                    </div>
                    <div>
                       <p className="font-black text-primary text-lg">{act.title}</p>
                       <p className="text-xs text-slate-400 font-bold flex items-center gap-1 justify-end">
                         <span>{new Date(act.time).toLocaleString('ar-EG')}</span>
                         <Clock className="w-3 h-3" />
                       </p>
                    </div>
                 </div>
                 <ChevronRight className="w-6 h-6 text-slate-200" />
              </div>
            )) : (
              <div className="text-center py-10 text-slate-300 font-bold italic">لا توجد نشاطات مؤخراً</div>
            )}
         </div>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, delta, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className={cn("absolute right-0 top-0 w-2 h-full transition-all group-hover:w-4", color)} />
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-5 rounded-3xl text-white shadow-xl", color)}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="text-green-600 text-xs font-black bg-green-50 px-3 py-1.5 rounded-full border border-green-100">{delta}</div>
      </div>
      <h4 className="text-slate-400 font-bold text-sm mb-1">{label}</h4>
      <p className="text-4xl font-black text-primary tracking-tighter">{value}</p>
    </div>
  );
}

function SidebarLink({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-start gap-4 p-4 rounded-2xl font-black text-sm mb-1.5 transition-all text-right",
        active 
          ? "bg-accent text-white shadow-xl shadow-accent/20 translate-x-1" 
          : "text-white/50 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-white" : "text-white/30")} />
      <span>{label}</span>
      {active && <motion.div layoutId="active-pill" className="w-1.5 h-1.5 bg-white rounded-full ml-auto" />}
    </button>
  );
}

function AdminAccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6 font-sans">
      <div className="bg-white p-12 rounded-[50px] shadow-2xl text-center max-w-lg border-b-8 border-red-500">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-xl">
           <ShieldCheck className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-primary mb-4 tracking-tight">الدخول ممنوع 🚫</h2>
        <p className="text-slate-500 mb-12 leading-relaxed text-lg font-medium">
          هذه المنطقة مخصصة بالكامل لمسؤولي المنصة. يرجى تسجيل الدخول بحساب المسؤول للوصول لهذه الإعدادات.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-primary text-white px-12 py-5 rounded-[24px] font-black text-lg hover:shadow-2xl hover:bg-black transition-all"
        >
          العودة للمنطقة الآمنة
        </button>
      </div>
    </div>
  );
}
