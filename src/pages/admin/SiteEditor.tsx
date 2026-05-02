import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '@/src/services/siteService';
import { Save, Plus, Trash2, Globe, Phone, Mail, MapPin, Type, Edit2, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { uploadToCloudinary } from '@/src/services/uploadService';

export default function SiteEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const { register, control, handleSubmit, reset, setValue, watch } = useForm<SiteSettings>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "stats"
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "features"
  });

  const { fields: facilityFields, append: appendFacility, remove: removeFacility } = useFieldArray({
    control,
    name: "facilities" as any
  });

  useEffect(() => {
    async function load() {
      const data = await getSiteSettings();
      reset(data);
      setLoading(false);
    }
    load();
  }, [reset]);

  const handleFileUpload = async (field: keyof SiteSettings, file: File) => {
    setUploading(field);
    try {
      const url = await uploadToCloudinary(file);
      setValue(field, url);
    } catch (err) {
      console.error(err);
      alert('خطأ في الرفع');
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = async (data: SiteSettings) => {
    setSaving(true);
    await updateSiteSettings(data);
    setSaving(false);
    alert("تم حفظ التعديلات بنجاح! 🎉");
  };

  if (loading) return <div className="text-center py-10">جاري تحميل البيانات...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 pb-20">
        
        {/* Basic Info */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b">
            <Globe className="text-accent w-6 h-6" />
            <h3 className="text-xl font-bold text-primary">المعلومات الأساسية</h3>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">اسم المركز / الموقع</label>
                 <input {...register('siteName')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right font-bold" />
               </div>
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">رابط صورة اللوجو (الشعار)</label>
                 <div className="flex gap-2">
                    <div className="relative flex-shrink-0">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleFileUpload('logoUrl', e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button type="button" className="bg-slate-100 p-4 rounded-xl text-slate-500 hover:bg-slate-200 transition-all">
                        {uploading === 'logoUrl' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </button>
                    </div>
                    <input {...register('logoUrl')} className="flex-grow bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="https://..." />
                 </div>
               </div>
            </div>
            <div className="text-right">
              <label className="block text-sm font-bold text-slate-700 mb-2">وصف المركز (يظهر في ذيل الموقع)</label>
              <textarea {...register('siteDescription')} rows={3} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
             <div className="flex items-center gap-3">
               <Edit2 className="text-accent w-6 h-6" />
               <h3 className="text-xl font-bold text-primary">مميزات السنتر (6 نقاط)</h3>
             </div>
             <button 
               type="button" 
               onClick={() => appendFeature({ icon: 'Users', title: 'ميزة جديدة', desc: 'وصف الميزة...' })}
               className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
             >
               <Plus className="w-4 h-4" />
               إضافة ميزة
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureFields.map((field, index) => (
              <div key={field.id} className="bg-slate-50 p-6 rounded-2xl relative">
                <button 
                  type="button" 
                  onClick={() => removeFeature(index)}
                  className="absolute -top-2 -left-2 bg-white text-red-500 p-1.5 rounded-full shadow-sm border border-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-4 text-right">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">الأيقونة (Users, BookOpen, Clock, TrendingUp, Heart, CheckCircle2)</label>
                    <input {...register(`features.${index}.icon` as const)} className="w-full bg-white border-slate-200 rounded-lg p-2 text-sm text-right" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">عنوان الميزة</label>
                    <input {...register(`features.${index}.title` as const)} className="w-full bg-white border-slate-200 rounded-lg p-2 font-bold text-right" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">وصف الميزة</label>
                    <textarea {...register(`features.${index}.desc` as const)} rows={2} className="w-full bg-white border-slate-200 rounded-lg p-2 text-sm text-right" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Facilities Section */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
             <div className="flex items-center gap-3">
               <ImageIcon className="text-accent w-6 h-6" />
               <h3 className="text-xl font-bold text-primary">صور مرافق السنتر (الصور في صفحة "عنا")</h3>
             </div>
             <button 
               type="button" 
               onClick={() => appendFacility("" as any)}
               className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
             >
               <Plus className="w-4 h-4" />
               إضافة صورة
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {facilityFields.map((field, index) => (
              <div key={field.id} className="relative group flex gap-2">
                <div className="relative flex-grow">
                  <input 
                    {...register(`facilities.${index}` as any)} 
                    placeholder="https://..." 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm text-right pr-10" 
                  />
                  <ImageIcon className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />
                </div>
                <div className="relative flex-shrink-0">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleFileUpload(`facilities.${index}` as any, e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <button type="button" className="bg-slate-100 p-3 rounded-xl text-slate-500 hover:bg-slate-200 transition-all h-full flex items-center justify-center">
                    {uploading === `facilities.${index}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </button>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFacility(index)}
                  className="absolute -top-2 -left-2 bg-white text-red-500 p-1.5 rounded-full shadow-sm border border-red-100 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Hero Section Editing */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b">
            <Globe className="text-accent w-6 h-6" />
            <h3 className="text-xl font-bold text-primary">الواجهة الرئيسية (Hero Section)</h3>
          </div>
          
          <div className="space-y-6">
            <div className="text-right">
              <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الواجهة (Badge)</label>
              <input {...register('heroBadge')} className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-accent transition-all text-right" />
            </div>
            
            <div className="text-right">
              <label className="block text-sm font-bold text-slate-700 mb-2">العنوان الرئيسي (H1)</label>
              <textarea {...register('heroTitle')} rows={2} className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-accent transition-all text-right font-bold text-2xl" />
            </div>

            <div className="text-right">
              <label className="block text-sm font-bold text-slate-700 mb-2">الوصف الفرعي</label>
              <textarea {...register('heroSubtitle')} rows={3} className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-accent transition-all text-right" />
            </div>

            <div className="text-right">
              <label className="block text-sm font-bold text-slate-700 mb-2">صورة الواجهة الرئيسية (Hero Image)</label>
              <div className="flex gap-2">
                <div className="relative flex-shrink-0">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleFileUpload('heroImage', e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <button type="button" className="bg-slate-100 p-4 rounded-xl text-slate-500 hover:bg-slate-200 transition-all">
                    {uploading === 'heroImage' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  </button>
                </div>
                <input {...register('heroImage')} className="flex-grow bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="https://..." />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
             <div className="flex items-center gap-3">
               <Type className="text-accent w-6 h-6" />
               <h3 className="text-xl font-bold text-primary">إحصائيات المركز</h3>
             </div>
             <button 
               type="button" 
               onClick={() => append({ label: 'مسمى جديد', value: '0' })}
               className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
             >
               <Plus className="w-4 h-4" />
               إضافة إحصائية
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-end bg-slate-50 p-4 rounded-2xl relative">
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="absolute -top-2 -left-2 bg-white text-red-500 p-1.5 rounded-full shadow-sm border border-red-100 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex-grow text-right">
                  <input {...register(`stats.${index}.label` as const)} placeholder="المسمى" className="w-full bg-white border-slate-200 rounded-lg p-2 text-sm text-right mb-2" />
                  <input {...register(`stats.${index}.value` as const)} placeholder="القيمة" className="w-full bg-white border-slate-200 rounded-lg p-2 font-bold text-right" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b">
            <Phone className="text-accent w-6 h-6" />
            <h3 className="text-xl font-bold text-primary">معلومات التواصل</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-right">
               <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-end gap-2">البريد الإلكتروني <Mail className="w-4 h-4" /></label>
               <input {...register('contactEmail')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
            </div>
            <div className="text-right">
               <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-end gap-2">رقم الهاتف <Phone className="w-4 h-4" /></label>
               <input {...register('contactPhone')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
            </div>
            <div className="text-right md:col-span-2">
               <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-end gap-2">العنوان بالتفصيل <MapPin className="w-4 h-4" /></label>
               <input {...register('contactAddress')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
            </div>
          </div>
        </section>

        {/* About & Mission */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b">
            <Edit2 className="text-accent w-6 h-6" />
            <h3 className="text-xl font-bold text-primary">عن المركز والرؤية</h3>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">عنوان "عن المركز"</label>
                 <input {...register('aboutTitle')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">عنوان "الرؤية"</label>
                 <input {...register('missionTitle')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">نص "عن المركز"</label>
                 <textarea {...register('aboutText')} rows={4} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">نص "الرؤية"</label>
                 <textarea {...register('missionText')} rows={4} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-right">
                  <label className="block text-sm font-bold text-slate-700 mb-2">رابط فيديو (لماذا نحن؟) - YouTube أو رفع مباشر</label>
                  <div className="flex gap-2">
                    <div className="relative flex-shrink-0">
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={e => e.target.files?.[0] && handleFileUpload('whyChooseUsVideoUrl', e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                      <button type="button" className="bg-slate-100 p-4 rounded-xl text-slate-500 hover:bg-slate-200 transition-all">
                        {uploading === 'whyChooseUsVideoUrl' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </button>
                    </div>
                    <input {...register('whyChooseUsVideoUrl')} className="flex-grow bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="رابط فيديو أو ارفع مباشرة" />
                  </div>
                </div>
                <div className="text-right">
                  <label className="block text-sm font-bold text-slate-700 mb-2">رابط صورة "عن المركز"</label>
                  <div className="flex gap-2">
                    <div className="relative flex-shrink-0">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleFileUpload('aboutImage', e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button type="button" className="bg-slate-100 p-4 rounded-xl text-slate-500 hover:bg-slate-200 transition-all">
                        {uploading === 'aboutImage' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </button>
                    </div>
                    <input {...register('aboutImage')} className="flex-grow bg-slate-50 border-none rounded-xl p-4 text-right" placeholder="https://..." />
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b">
            <Phone className="text-accent w-6 h-6" />
            <h3 className="text-xl font-bold text-primary">بيانات الاتصال والسوشيال ميديا</h3>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف الأساسي</label>
                 <input {...register('contactPhone')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف الإضافي</label>
                 <input {...register('contactPhoneAlt')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني الأساسي</label>
                 <input {...register('contactEmail')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني الإضافي</label>
                 <input {...register('contactEmailAlt')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
            </div>
            <div className="text-right">
              <label className="block text-sm font-bold text-slate-700 mb-2">عنوان المقر</label>
              <input {...register('contactAddress')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">رابط فيسبوك</label>
                 <input {...register('facebookUrl')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">رابط انستجرام</label>
                 <input {...register('instagramUrl')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
               <div className="text-right">
                 <label className="block text-sm font-bold text-slate-700 mb-2">رابط واتساب</label>
                 <input {...register('whatsappUrl')} className="w-full bg-slate-50 border-none rounded-xl p-4 text-right" />
               </div>
            </div>
          </div>
        </section>

        {/* Floating Save Button */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60]">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-accent text-white px-12 py-5 rounded-3xl font-bold text-xl shadow-2xl shadow-accent/40 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <span className="animate-spin text-2xl">⏳</span> : <Save className="w-6 h-6" />}
            {saving ? "جاري الحفظ..." : "حفظ التغييرات الآن"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
