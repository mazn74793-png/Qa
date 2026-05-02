import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, TrendingUp, Users, BookOpen, Clock, Heart, Edit2, Save, X, Settings, ShieldCheck, Image as ImageIcon, Calendar, GraduationCap, ChevronLeft, Play, Video, Download, Search, Sparkles, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '@/src/services/siteService';
import { dataService } from '@/src/services/dataService';
import { useAdmin } from '@/src/hooks/useAdmin';
import { cn } from '@/src/lib/utils';

export default function Home() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SiteSettings | null>(null);
  const [realSchedule, setRealSchedule] = useState<any[]>([]);
  const [realTeachers, setRealTeachers] = useState<any[]>([]);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    getSiteSettings().then(data => {
      setSettings(data);
      setEditData(data);
    });

    const unsubSchedule = dataService.subscribeSchedule(data => {
      setRealSchedule(data.slice(0, 3)); // Just show 3 for the preview
    });

    const unsubTeachers = dataService.subscribeTeachers(data => {
      setRealTeachers(data.slice(0, 4)); // Show 4 for the showcase
    });

    return () => {
      unsubSchedule();
      unsubTeachers();
    };
  }, []);

  const handleSave = async () => {
    if (!editData) return;
    await updateSiteSettings(editData);
    setSettings(editData);
    setIsEditing(false);
    alert("تم حفظ التعديلات بنجاح!");
  };

  if (!settings || !editData) return <div className="min-h-screen bg-primary flex items-center justify-center text-white">جاري التحميل...</div>;

  const currentData = isEditing ? editData : settings;

  const updateField = (field: keyof SiteSettings, value: string) => {
    setEditData(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div id="home-page" className="overflow-x-hidden">
      {/* Admin Quick Editor Panel */}
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2">
           <Link 
             to="/admin?tab=content"
             className="bg-primary text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 font-bold"
           >
             <Settings className="w-5 h-5 md:w-6 md:h-6" />
             <span className="text-xs md:text-base">الإعدادات الكاملة</span>
           </Link>
          {isEditing ? (
            <>
              <button 
                onClick={handleSave}
                className="bg-green-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 font-bold"
              >
                <Save className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-xs md:text-base">حفظ</span>
              </button>
              <button 
                onClick={() => { setIsEditing(false); setEditData(settings); }}
                className="bg-red-500 text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 font-bold"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-xs md:text-base">إلغاء</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-accent text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-2 font-bold"
            >
              <Edit2 className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs md:text-base">تعديل النصوص</span>
            </button>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="relative h-[90vh] md:min-h-screen flex items-center pt-24 lg:pt-0 overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 w-full h-full">
           <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white text-right lg:text-right"
            >
              <div className="relative inline-block group mb-6">
                <div 
                  className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-xs md:text-sm font-black tracking-widest uppercase">{currentData.heroBadge}</span>
                </div>
              </div>
              
              <h1 
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => updateField('heroTitle', e.currentTarget.textContent || '')}
                className={cn(
                  "text-4xl sm:text-6xl md:text-8xl font-black mb-6 leading-[1] md:leading-[0.95] tracking-tighter whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-accent rounded-xl",
                  isEditing && "bg-white/10 ring-2 ring-accent"
                )}
              >
                {currentData.heroTitle}
              </h1>
              
              <p 
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => updateField('heroSubtitle', e.currentTarget.textContent || '')}
                className={cn(
                  "text-base md:text-2xl text-white/50 mb-10 max-w-2xl md:ml-auto leading-relaxed font-bold focus:outline-none focus:ring-2 focus:ring-accent rounded-xl",
                  isEditing && "bg-white/10 ring-2 ring-accent"
                )}
              >
                {currentData.heroSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-end">
                <Link to="/portal" className="w-full sm:w-auto px-8 md:px-10 py-5 bg-accent text-white rounded-2xl font-black text-lg md:text-xl shadow-2xl shadow-accent/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                  ابدأ رحلتك الآن
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <Link to="/schedule" className="w-full sm:w-auto px-8 md:px-10 py-5 bg-white/5 text-white rounded-2xl font-black text-lg md:text-xl border border-white/10 hover:bg-white/10 transition-all text-center">
                  جدول الحصص
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-end gap-8 text-white/30 border-t border-white/5 pt-8">
                 <div className="text-center">
                    <p className="text-2xl font-black text-white">+5K</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest">طالب مسجل</p>
                 </div>
                 <div className="h-8 w-[1px] bg-white/10" />
                 <div className="text-center">
                    <p className="text-2xl font-black text-white">+50</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest">مدرس خبير</p>
                 </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative hidden lg:block"
            >
              <div className="relative z-10 p-2 bg-white/5 backdrop-blur-3xl rounded-[60px] border border-white/10 shadow-2xl">
                <img src={currentData.heroImage} alt="Students" className="rounded-[50px] w-full h-[650px] object-cover ring-1 ring-white/10" referrerPolicy="no-referrer" />
                
                {/* Floating Card */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-12 top-1/4 bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 flex items-center gap-4"
                >
                   <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white">
                      <TrendingUp className="w-6 h-6" />
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-slate-400">نسبة النجاح</p>
                      <p className="text-2xl font-black text-primary">%99.8</p>
                   </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Schedule Preview Section - NEW */}
      <section className="py-24 bg-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
         
         <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
               <span className="text-accent font-black tracking-widest uppercase text-sm inline-block mb-3">التنظيم الدراسي</span>
               <h2 className="text-3xl md:text-6xl font-black text-primary leading-tight">جدول الحصص الأسبوعي</h2>
               <p className="text-slate-500 font-bold mt-4">لا تفوت أي لحظة تعليمية، تابع مواعيد حصصك بدقة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 text-right">
               {realSchedule.length > 0 ? (
                 realSchedule.map((item, i) => (
                   <motion.div 
                      key={i}
                      whileHover={{ y: -10 }}
                      className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] relative overflow-hidden group"
                   >
                      <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-6">
                         <div className="bg-white px-4 py-1 rounded-full text-xs font-black text-slate-400 shadow-sm border border-slate-100">
                            {item.grade}
                         </div>
                         <div className="text-accent font-black">{item.day}</div>
                      </div>
                      <h3 className="text-2xl font-black text-primary mb-1">{item.subject}</h3>
                      <p className="text-slate-500 font-bold mb-4">{item.teacher}</p>
                      <div className="flex items-center gap-2 text-primary/40 font-mono font-bold justify-end">
                         <span>{item.time}</span>
                         <Clock className="w-4 h-4" />
                      </div>
                   </motion.div>
                 ))
               ) : (
                 <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-[40px] border border-dashed border-slate-200 font-bold">
                    سيتم عرض الحصص القادمة هنا قريباً 🗓️
                 </div>
               )}
            </div>

            <div className="text-center">
               <Link to="/schedule" className="inline-flex items-center gap-4 px-10 py-5 bg-primary text-white rounded-3xl font-black text-xl hover:bg-accent hover:scale-105 transition-all shadow-xl shadow-primary/20">
                  اضغط هنا لمعرفة مواعيد جميع الحصص 🗓️
                  <ChevronLeft className="w-6 h-6" />
               </Link>
            </div>
         </div>
      </section>

      {/* Teachers Showcase Section - NEW */}
      <section className="py-24 bg-slate-900 relative">
         <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
               <div className="text-right flex-grow">
                  <span className="text-accent font-black tracking-widest uppercase text-sm inline-block mb-3">نخبة الخبراء</span>
                  <h2 className="text-3xl md:text-6xl font-black text-white leading-tight">مدرسون من الطراز الرفيع</h2>
               </div>
               <Link to="/teachers" className="px-8 py-4 bg-white text-primary rounded-2xl font-black flex items-center gap-2 hover:bg-accent hover:text-white transition-all">
                  استعرض جميع المدرسين
                  <Users className="w-5 h-5" />
               </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {realTeachers.length > 0 ? (
                 realTeachers.map((t, idx) => (
                   <div key={idx} className="group relative rounded-[40px] overflow-hidden aspect-[4/5] bg-white/5 border border-white/5">
                      <img src={t.image || 'https://via.placeholder.com/400x500?text=Teacher'} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt={t.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end text-right">
                         <p className="text-accent font-black text-sm mb-1 uppercase tracking-tighter">{t.subject}</p>
                         <h3 className="text-xl font-black text-white">{t.name}</h3>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="col-span-full py-20 text-center text-white/20 font-black border border-dashed border-white/10 rounded-[40px]">
                    سيتم عرض نخبة المدرسين قريباً 👨‍🏫
                 </div>
               )}
            </div>
         </div>
      </section>

      {/* About Section on Home */}
      <section className="py-24 overflow-hidden bg-white">
         <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="order-2 lg:order-1 relative group scale-95 hover:scale-100 transition-transform duration-700">
                  <div className="aspect-video lg:aspect-square bg-slate-100 rounded-[60px] overflow-hidden shadow-2xl border-4 border-slate-50 relative">
                    <img src={currentData.aboutImage} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-10 -right-10 bg-accent text-white p-10 rounded-full shadow-2xl shadow-accent/40 hidden md:flex flex-col items-center justify-center w-48 h-48">
                     <p className="font-black text-4xl mb-1 tracking-tighter">+10</p>
                     <p className="font-black text-xs uppercase tracking-widest text-center">سنوات خبرة</p>
                  </div>
               </div>
               <div className="order-1 lg:order-2 text-right">
                  <h2 className="text-accent font-black mb-4 flex items-center justify-end gap-2 text-lg uppercase tracking-widest">
                    <span>قصة التميز</span>
                    <span className="w-12 h-1.5 bg-accent rounded-full" />
                  </h2>
                  <h3 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => updateField('aboutTitle', e.currentTarget.textContent || '')}
                    className={cn(
                      "text-3xl md:text-6xl font-black text-primary mb-8 leading-[1.1] tracking-tight focus:outline-none",
                      isEditing && "ring-2 ring-accent bg-accent/5 p-2 rounded-xl"
                    )}
                  >
                    {currentData.aboutTitle}
                  </h3>
                  <p 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => updateField('aboutText', e.currentTarget.textContent || '')}
                    className={cn(
                       "text-lg md:text-xl text-slate-500 leading-relaxed mb-10 font-bold italic border-r-4 border-accent pr-6 focus:outline-none",
                       isEditing && "ring-2 ring-accent bg-accent/5 p-4 rounded-xl"
                    )}
                  >
                    {currentData.aboutText}
                  </p>
                  <Link to="/about" className="px-10 py-5 bg-slate-900 text-white font-black text-lg rounded-3xl hover:bg-accent transition-all inline-flex items-center gap-3">
                    اعرف المزيد عنا
                    <ArrowLeft className="w-6 h-6" />
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Materials & Resources - NEW */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
         <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="lg:w-1/2 text-right">
                  <span className="text-accent font-black tracking-widest uppercase text-sm mb-3 block">المصادر التعليمية</span>
                  <h2 className="text-3xl md:text-6xl font-black text-primary leading-tight mb-8">ملازم ومذكرات حصرية لكل مادة</h2>
                  <p className="text-lg text-slate-500 font-bold mb-10 leading-relaxed">نوفر للطلاب أفضل المذكرات التعليمية الملخصة والشاملة، مصممة بطريقة تسهل الفهم والتحصيل وتضمن التفوق.</p>
                  
                  <div className="space-y-6 mb-12">
                     <div className="flex items-center justify-end gap-4">
                        <span className="text-primary font-black text-lg">مذكرات شرح مبسطة</span>
                        <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-accent">
                           <CheckCircle2 className="w-6 h-6" />
                        </div>
                     </div>
                     <div className="flex items-center justify-end gap-4">
                        <span className="text-primary font-black text-lg">بنك أسئلة وتدريبات شاملة</span>
                        <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-accent">
                           <CheckCircle2 className="w-6 h-6" />
                        </div>
                     </div>
                     <div className="flex items-center justify-end gap-4">
                        <span className="text-primary font-black text-lg">ملخصات ليلة الامتحان</span>
                        <div className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-accent">
                           <CheckCircle2 className="w-6 h-6" />
                        </div>
                     </div>
                  </div>

                  <Link to="/portal" className="inline-flex items-center gap-4 px-10 py-5 bg-accent text-white rounded-3xl font-black text-xl hover:bg-primary transition-all shadow-xl shadow-accent/20">
                     استعرض وحمل المذكرات الآن 📚
                     <Download className="w-6 h-6" />
                  </Link>
               </div>
               
               <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                  <div className="space-y-4 pt-12">
                     <div className="aspect-[3/4] bg-white rounded-[32px] shadow-xl p-4 border border-slate-100 flex flex-col justify-center items-center text-center group hover:bg-primary hover:text-white transition-all cursor-default">
                        <BookOpen className="w-12 h-12 mb-4 text-accent group-hover:text-white" />
                        <p className="font-black text-lg">لغة عربية</p>
                        <p className="text-[10px] uppercase font-bold opacity-40">مذكرة الشرح</p>
                     </div>
                     <div className="aspect-[3/4] bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=500" className="w-full h-full object-cover" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="aspect-[3/4] bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500" className="w-full h-full object-cover" />
                     </div>
                     <div className="aspect-[3/4] bg-white rounded-[32px] shadow-xl p-4 border border-slate-100 flex flex-col justify-center items-center text-center group hover:bg-accent hover:text-white transition-all cursor-default">
                        <CheckCircle2 className="w-12 h-12 mb-4 text-primary group-hover:text-white" />
                        <p className="font-black text-lg">فيزياء</p>
                        <p className="text-[10px] uppercase font-bold opacity-40">بنك الأسئلة</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Courses Preview - NEW */}
      <section className="py-24 bg-white">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
               <div className="text-right">
                  <span className="text-accent font-black tracking-widest uppercase text-sm mb-3 block">المناهج الدراسية</span>
                  <h2 className="text-3xl md:text-6xl font-black text-primary leading-tight">شرح وافٍ لكافة المواد</h2>
                  <p className="text-lg text-slate-500 font-bold mt-4 leading-relaxed">نغطي كافة المواد الدراسية للمرحلة الثانوية والإعدادية بأسلوب علمي متطور يساعدك على التفوق والتميز.</p>
               </div>
               <div className="flex flex-wrap justify-end gap-3">
                  <Link to="/courses" className="px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-primary hover:border-accent hover:text-accent transition-all flex items-center gap-2">
                     عرض جميع المواد
                     <BookOpen className="w-5 h-5" />
                  </Link>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { name: 'اللغة العربية', level: 'المرحلة الثانوية', color: 'bg-orange-50', text: 'text-orange-500' },
                 { name: 'الفيزياء', level: 'المرحلة الثانوية', color: 'bg-blue-50', text: 'text-blue-500' },
                 { name: 'الكيمياء', level: 'المرحلة الثانوية', color: 'bg-green-50', text: 'text-green-500' },
                 { name: 'الرياضيات', level: 'المرحلة الثانوية', color: 'bg-purple-50', text: 'text-purple-500' },
               ].map((c, i) => (
                 <Link to="/courses" key={i} className="group p-8 rounded-[40px] flex flex-col items-center text-center transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100">
                    <div className={cn("w-20 h-20 rounded-[30px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", c.color, c.text)}>
                       <BookOpen className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-primary mb-1">{c.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.level}</p>
                 </Link>
               ))}
            </div>
         </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="text-right">
                <span className="text-accent font-black tracking-widest uppercase text-sm mb-3 block">لماذا نحن؟</span>
                <h2 className="text-3xl md:text-6xl font-black text-primary leading-tight mb-8">التعليم كما يجب أن يكون</h2>
                <div className="space-y-6">
                   {(currentData.features || []).map((feature, i) => (
                      <div key={i} className="flex items-start justify-end gap-6 group">
                         <div className="text-right">
                            <h4 className="text-xl font-black text-primary mb-1 group-hover:text-accent transition-colors">{feature.title}</h4>
                            <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm">{feature.desc}</p>
                         </div>
                         <div className="w-16 h-16 bg-slate-50 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border border-slate-100 group-hover:bg-accent group-hover:text-white transition-all">
                            {feature.icon === 'Users' && <Users className="w-7 h-7" />}
                            {feature.icon === 'BookOpen' && <BookOpen className="w-7 h-7" />}
                            {feature.icon === 'Clock' && <Clock className="w-7 h-7" />}
                            {feature.icon === 'TrendingUp' && <TrendingUp className="w-7 h-7" />}
                            {feature.icon === 'Heart' && <Heart className="w-7 h-7" />}
                            {feature.icon === 'CheckCircle2' && <CheckCircle2 className="w-7 h-7" />}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
             
             <div className="relative group/video">
                <div className="aspect-[4/3] bg-primary rounded-[60px] p-1 shadow-2xl relative z-10 overflow-hidden border-4 border-white">
                   {currentData.whyChooseUsVideoUrl ? (
                     currentData.whyChooseUsVideoUrl.includes('cloudinary') ? (
                       <video 
                         src={currentData.whyChooseUsVideoUrl} 
                         controls 
                         className="w-full h-full rounded-[56px]"
                       />
                     ) : (
                       <iframe 
                         src={currentData.whyChooseUsVideoUrl} 
                         className="w-full h-full rounded-[56px]"
                         title="Why Choose Us"
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                         allowFullScreen
                       />
                     )
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-white/30 gap-4 bg-slate-800">
                        <Youtube className="w-20 h-20" />
                        <p className="font-bold">أضف رابط فيديو يوتيوب أو Cloudinary هنا</p>
                     </div>
                   )}
                   
                   {isEditing && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity z-20">
                        <button 
                          onClick={() => {
                            const url = prompt('أدخل رابط الفيديو الجديد (YouTube Embed أو Cloudinary):', currentData.whyChooseUsVideoUrl);
                            if (url !== null) updateField('whyChooseUsVideoUrl', url);
                          }}
                          className="bg-white text-primary px-6 py-3 rounded-2xl font-black flex items-center gap-2"
                        >
                          <Video className="w-6 h-6 text-accent" />
                          تغيير الفيديو
                        </button>
                     </div>
                   )}
                </div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
             </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-accent relative overflow-hidden">
         <div className="container mx-auto px-4 text-center relative z-10">
             <h2 className="text-3xl md:text-6xl font-black text-white mb-8 leading-tight">جاهز لتبدأ رحلة النجاح معنا؟</h2>
             <p className="text-white/80 font-bold mb-12 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed">انضم الآن إلى آلاف الطلاب المتفوقين في سنتر QA واحجز مكانك في طليعة الناجحين</p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/portal" className="w-full sm:w-auto px-12 py-6 bg-white text-accent rounded-3xl font-black text-2xl shadow-2xl hover:scale-105 transition-all">
                   سجل دخولك الآن
                </Link>
                <Link to="/contact" className="w-full sm:w-auto px-12 py-6 border-4 border-white/20 text-white rounded-3xl font-black text-2xl hover:bg-white/10 transition-all">
                   تواصل مع الدعم
                </Link>
             </div>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
      </section>
    </div>
  );
}

