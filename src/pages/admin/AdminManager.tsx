import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { dataService } from '@/src/services/dataService';
import { Plus, Trash2, ShieldCheck, Mail, UserPlus, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminManager() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = dataService.subscribeAdmins(setAdmins);
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const userId = formData.get('userId') as string;
    const email = formData.get('email') as string;

    if (!userId || !email) {
      alert("يرجى إدخال معرف المستخدم والبريد الإلكتروني");
      setLoading(false);
      return;
    }

    try {
      await dataService.addAdmin(userId, email);
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من سحب صلاحيات الأدمن من هذا المستخدم؟')) {
      await dataService.deleteAdmin(id);
    }
  };

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="order-2 md:order-1">
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-accent text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
          >
            <UserPlus className="w-5 h-5" />
            إضافة أدمن جديد
          </button>
        </div>
        <div className="order-1 md:order-2 flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">إدارة فريق العمل</h2>
            <p className="text-slate-500">تحكم في من يملك صلاحيات الوصول للوحة التحكم.</p>
          </div>
          <div className="bg-primary/5 p-4 rounded-2xl text-primary">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm"
          >
            <div className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl relative">
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-bold text-primary mb-6 text-right">إضافة مسؤول جديد</h3>
              
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-2 text-right">
                  <label className="text-sm font-bold text-slate-700">البريد الإلكتروني للزميل</label>
                  <input 
                    name="email" 
                    type="email"
                    required
                    className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-2xl p-4 transition-all text-right" 
                    placeholder="example@gmail.com"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-sm font-bold text-slate-700">معرف المستخدم (UID)</label>
                  <input 
                    name="userId" 
                    required
                    className="w-full bg-slate-50 border-transparent focus:border-accent focus:bg-white focus:ring-0 rounded-2xl p-4 transition-all text-right font-mono text-sm" 
                    placeholder="UID..."
                  />
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-[11px] text-blue-600 leading-relaxed">
                    <p className="font-bold mb-1">كيف تحصل على الـ UID؟</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>اطلب من الزميل تسجيل الدخول أولاً في الموقع.</li>
                      <li>بعد تسجيل الدخول، سيظهر الـ UID الخاص به في صفحة "حسابي".</li>
                      <li>قم بنسخه ولصقه هنا لمنحه الصلاحيات.</li>
                    </ol>
                  </div>
                </div>
                
                <button 
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl shadow-xl shadow-accent/20 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? 'جاري الإضافة...' : 'منح صلاحيات الأدمن'}
                  <Save className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <motion.div 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={admin.id}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-accent/30 transition-all"
          >
            <button 
              onClick={() => handleDelete(admin.id)}
              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 text-right">
              <div>
                <h4 className="font-bold text-primary truncate max-w-[150px]">{admin.email}</h4>
                <p className="text-xs text-slate-400 font-mono">{admin.id}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-accent group-hover:bg-accent/5 transition-all">
                <Mail className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
