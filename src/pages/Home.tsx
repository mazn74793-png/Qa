import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, TrendingUp, Users, BookOpen, Clock, Heart, Edit2, Save, X, Settings, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '@/src/services/siteService';
import { useAdmin } from '@/src/hooks/useAdmin';
import { cn } from '@/src/lib/utils';

export default function Home() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SiteSettings | null>(null);
  const { isAdmin } = useAdmin();

  useEffect(() => {
    getSiteSettings().then(data => {
      setSettings(data);
      setEditData(data);
    });
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
    <div id="home-page">
      {/* Admin Quick Editor Panel */}
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2">
           <Link 
             to="/admin/settings"
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
      <section id="hero" className="relative min-h-screen flex items-center pt-32 lg:pt-20 overflow-hidden bg-primary">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/10 skew-x-12 -translate-y-20 origin-top" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white text-right"
            >
              <div className="relative inline-block group">
                <div 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => updateField('heroBadge', e.currentTarget.textContent || '')}
                  className={cn(
                    "inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 mb-6 focus:outline-none focus:ring-2 focus:ring-accent",
                    isEditing && "ring-2 ring-accent bg-accent/20 cursor-text"
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-bold">{currentData.heroBadge}</span>
                </div>
              </div>
              
              <h1 
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => updateField('heroTitle', e.currentTarget.textContent || '')}
                className={cn(
                  "text-5xl md:text-7xl font-bold mb-6 leading-[1.1] whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-accent rounded-lg",
                  isEditing && "bg-white/5 cursor-text ring-1 ring-white/20"
                )}
              >
                {currentData.heroTitle}
              </h1>
              
              <p 
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                onBlur={(e) => updateField('heroSubtitle', e.currentTarget.textContent || '')}
                className={cn(
                  "text-xl text-white/70 mb-10 max-w-xl md:ml-auto leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent rounded-lg",
                  isEditing && "bg-white/5 cursor-text ring-1 ring-white/20"
                )}
              >
                {currentData.heroSubtitle}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 justify-end">
                <Link to="/portal" className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-accent/20 transition-all flex items-center gap-2">
                  سجل الآن مجاناً
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link to="/courses" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg border border-white/20 backdrop-blur-md transition-all">
                  استعرض المواد الدراسية
                </Link>
              </div>
            </motion.div>

            <div className="relative hidden lg:block">
              <div className="relative z-10 bg-gradient-to-tr from-accent/20 to-white/5 rounded-[40px] p-4 border border-white/10 group">
                <img src={currentData.heroImage} alt="Students" className="rounded-[30px] w-full h-[550px] object-cover shadow-2xl" referrerPolicy="no-referrer" />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-[30px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        const url = prompt('أدخل رابط الصورة الجديد:', currentData.heroImage);
                        if (url) updateField('heroImage', url);
                      }}
                      className="bg-white text-primary p-4 rounded-2xl font-bold flex items-center gap-2"
                    >
                      <ImageIcon className="w-5 h-5" />
                      تغيير الصورة
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-right">
            {currentData.stats.map((stat, i) => (
              <div key={i} className="text-center group relative">
                <div 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    const newStats = [...currentData.stats];
                    newStats[i] = { ...newStats[i], value: e.currentTarget.textContent || '' };
                    updateField('stats', newStats as any);
                  }}
                  className={cn(
                    "text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight rounded focus:outline-none focus:ring-1 focus:ring-accent",
                    isEditing && "bg-slate-50 ring-1 ring-slate-200"
                  )}
                >
                  {stat.value}
                </div>
                <div 
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    const newStats = [...currentData.stats];
                    newStats[i] = { ...newStats[i], label: e.currentTarget.textContent || '' };
                    updateField('stats', newStats as any);
                  }}
                  className={cn(
                    "text-slate-500 font-medium rounded focus:outline-none focus:ring-1 focus:ring-accent",
                    isEditing && "bg-slate-50 ring-1 ring-slate-200"
                  )}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section on Home */}
      <section className="py-24 overflow-hidden">
         <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="order-2 lg:order-1 relative group">
                  <div className="aspect-video lg:aspect-square bg-slate-100 rounded-[50px] overflow-hidden shadow-2xl border-8 border-white relative">
                    <img src={currentData.aboutImage} className="w-full h-full object-cover" />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            const url = prompt('أدخل رابط الصورة الجديد:', currentData.aboutImage);
                            if (url) updateField('aboutImage', url);
                          }}
                          className="bg-white text-primary p-4 rounded-2xl font-bold flex items-center gap-2"
                        >
                          <ImageIcon className="w-5 h-5" />
                          تغيير الصورة
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-10 -right-10 bg-accent text-white p-8 rounded-3xl shadow-2xl hidden md:block">
                     <Users className="w-10 h-10 mb-2" />
                     <p className="font-bold text-2xl tracking-tighter">أفضل بيئة تعليمية</p>
                  </div>
               </div>
               <div className="order-1 lg:order-2 text-right">
                  <h2 className="text-accent font-bold mb-4 flex items-center justify-end gap-2 text-lg">
                    <span>من نحن</span>
                    <span className="w-8 h-1 bg-accent rounded-full" />
                  </h2>
                  <h3 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => updateField('aboutTitle', e.currentTarget.textContent || '')}
                    className={cn(
                      "text-4xl md:text-5xl font-bold text-primary mb-8 leading-tight focus:outline-none",
                      isEditing && "ring-2 ring-accent bg-accent/5 p-2 rounded-lg"
                    )}
                  >
                    {currentData.aboutTitle}
                  </h3>
                  <p 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => updateField('aboutText', e.currentTarget.textContent || '')}
                    className={cn(
                      "text-xl text-slate-500 leading-relaxed mb-10 focus:outline-none",
                      isEditing && "ring-2 ring-accent bg-accent/5 p-2 rounded-lg"
                    )}
                  >
                    {currentData.aboutText}
                  </p>
                  <Link to="/about" className="text-primary font-bold text-lg flex items-center justify-end gap-2 hover:text-accent transition-all group">
                    اقرأ المزيد عن المركز
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Features - Hardcoded for now but could be made dynamic */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">ماذا يميز سنتر QA؟</h2>
            <div className="w-20 h-1.5 bg-accent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(currentData.features || []).map((feature, i) => {
              const Icon = (feature.icon === 'Users' ? Users : 
                           feature.icon === 'BookOpen' ? BookOpen :
                           feature.icon === 'Clock' ? Clock :
                           feature.icon === 'TrendingUp' ? TrendingUp :
                           feature.icon === 'Heart' ? Heart :
                           feature.icon === 'CheckCircle2' ? CheckCircle2 : Users);

              return (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const newFeatures = [...currentData.features];
                      newFeatures[i] = { ...newFeatures[i], title: e.currentTarget.textContent || '' };
                      updateField('features', newFeatures as any);
                    }}
                    className={cn(
                      "text-xl font-bold text-primary mb-3 focus:outline-none",
                      isEditing && "ring-1 ring-accent"
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const newFeatures = [...currentData.features];
                      newFeatures[i] = { ...newFeatures[i], desc: e.currentTarget.textContent || '' };
                      updateField('features', newFeatures as any);
                    }}
                    className={cn(
                      "text-slate-500 leading-relaxed focus:outline-none",
                      isEditing && "ring-1 ring-accent"
                    )}
                  >
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
