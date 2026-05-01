import { useState } from 'react';
import { useAdmin } from '@/src/hooks/useAdmin';
import { 
  BarChart3, 
  Settings2, 
  Users, 
  BookOpen, 
  Calendar, 
  LogOut, 
  LayoutDashboard,
  Save,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import SiteEditor from './SiteEditor';
import CourseManager from './CourseManager';
import TeacherManager from './TeacherManager';
import ScheduleManager from './ScheduleManager';
import AdminManager from './AdminManager';

type AdminTab = 'overview' | 'content' | 'courses' | 'teachers' | 'schedule' | 'admins';

export default function AdminDashboard() {
  const { isAdmin, loading, user } = useAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  if (!isAdmin) return <AdminAccessDenied />;

  return (
    <div id="admin-panel" className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-primary text-white p-6 md:min-h-screen sticky top-0 z-50">
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/10">
          <div className="bg-accent p-2 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <h2 className="font-bold">لوحة الإدارة</h2>
            <p className="text-xs text-white/50">QA Education System</p>
          </div>
        </div>

        <nav className="space-y-2">
          <SidebarLink active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="نظرة عامة" />
          <SidebarLink active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={Settings2} label="محتوى الموقع" />
          <SidebarLink active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={BookOpen} label="إدارة المواد" />
          <SidebarLink active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} icon={Users} label="إدارة المدرسين" />
          <SidebarLink active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={Calendar} label="إدارة الجدول" />
          <SidebarLink active={activeTab === 'admins'} onClick={() => setActiveTab('admins')} icon={ShieldCheck} label="إدارة المسؤولين" />
        </nav>

        <div className="mt-auto pt-10">
          <div className="bg-white/5 p-4 rounded-2xl mb-6">
            <p className="text-xs text-white/40 mb-1">المسؤول الحالي</p>
            <p className="text-sm font-bold truncate">{user?.email}</p>
          </div>
          <button className="flex items-center gap-3 text-red-400 hover:text-red-300 font-bold transition-all p-2">
            <LogOut className="w-5 h-5" />
            خروج من النظام
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-4 md:p-10 pt-24 md:pt-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">أهلاً بك في غرفة القيادة 🚀</h1>
            <p className="text-slate-500">من هنا يمكنك التحكم في كل ذرة في الموقع.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-600">النظام متصل</span>
             </div>
          </div>
        </header>

        <div className="max-w-6xl">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'content' && <SiteEditor />}
          {activeTab === 'courses' && <CourseManager />}
          {activeTab === 'teachers' && <TeacherManager />}
          {activeTab === 'schedule' && <ScheduleManager />}
          {activeTab === 'admins' && <AdminManager />}
        </div>
      </main>
    </div>
  );
}

function OverviewView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatBox label="إجمالي الطلاب" value="1,250" delta="+12%" icon={Users} color="bg-blue-500" />
      <StatBox label="المواد المفعلة" value="24" delta="0%" icon={BookOpen} color="bg-accent" />
      <StatBox label="زيارات اليوم" value="840" delta="+25%" icon={BarChart3} color="bg-green-500" />
      
      <div className="md:col-span-3 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
         <h3 className="text-xl font-bold text-primary mb-6">آخر النشاطات</h3>
         <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                 <div className="flex items-center gap-4 text-right">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-accent">
                       {i === 1 ? <Plus className="w-5 h-5"/> : <Edit3 className="w-5 h-5"/>}
                    </div>
                    <div>
                       <p className="font-bold text-primary">{i === 1 ? 'تم إضافة مدرس جديد: أ/ خالد يوسف' : 'تم تحديث جدول الصف الثالث الثانوي'}</p>
                       <p className="text-xs text-slate-500">منذ {i * 10} دقائق</p>
                    </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>
            ))}
         </div>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value, delta, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className={cn("absolute right-0 top-0 w-1.5 h-full transition-all group-hover:w-3", color)} />
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-4 rounded-2xl text-white", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-green-500 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg">{delta}</div>
      </div>
      <h4 className="text-slate-500 font-medium mb-1">{label}</h4>
      <p className="text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}

function SidebarLink({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl font-bold mb-1 transition-all",
        active ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-white/60 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

function AdminAccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl text-center max-w-lg border-b-8 border-red-500">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
           <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">الدخول ممنوع 🚫</h2>
        <p className="text-slate-500 mb-10 leading-relaxed text-lg">
          أنت لا تملك صلاحيات المسؤول. هذا القسم مخصص لإدارة المركز فقط. إذا كنت تعتقد أن هناك خطأ، يرجى مراجعة مبرمج النظام.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all"
        >
          العودة للمنطقة الآمنة
        </button>
      </div>
    </div>
  );
}
