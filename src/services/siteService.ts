import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroImage: string;
  stats: { label: string, value: string }[];
  features: { icon: string, title: string, desc: string }[];
  facilities: string[];
  contactPhone: string;
  contactPhoneAlt: string;
  contactEmail: string;
  contactEmailAlt: string;
  contactAddress: string;
  aboutTitle: string;
  aboutText: string;
  aboutImage: string;
  missionTitle: string;
  missionText: string;
  facebookUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "QA EDUCATION",
  siteDescription: "مركز QA التعليمي هو رفيقك في طريق النجاح والتميز الدراسي. نوفر بيئة تعليمية متطورة تهدف إلى تنمية مهارات الطلاب.",
  logoUrl: "",
  heroTitle: "مستقبلك يبدأ من مركز QA التعليمي",
  heroSubtitle: "نقدم تجربة تعليمية فريدة قائمة على الابتكار والتميز، مع نخبة من أفضل المدرسين في كافة التخصصات والمراحل الدراسية.",
  heroBadge: "بداية الحجز للعام الدراسي الجديد 2024-2025",
  heroImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
  stats: [
    { label: 'نسبة النجاح', value: '99%' },
    { label: 'طالب متفوق', value: '5000+' },
    { label: 'مدرس خبير', value: '50+' },
    { label: 'سنة خبرة', value: '15+' },
  ],
  features: [
    { icon: 'Users', title: 'نخبة المدرسين', desc: 'مجموعة مختارة من أقوى المدرسين أصحاب الخبرة في تبسيط المعلومة.' },
    { icon: 'BookOpen', title: 'مذكرات حصرية', desc: 'مناهج مطورة ومذكرات خاصة تغطي كافة جوانب الامتحانات.' },
    { icon: 'Clock', title: 'مواعيد مرنة', desc: 'أكثر من موعد للمادة الواحدة لتناسب جدولك الدراسي.' },
    { icon: 'TrendingUp', title: 'متابعة دورية', desc: 'امتحانات أسبوعية وتقارير مستمرة لولي الأمر عن مستوى الطالب.' },
    { icon: 'Heart', title: 'بيئة تعليمية', desc: 'قاعات مجهزة بأحدث الوسائل التكنولوجية لراحة الطالب.' },
    { icon: 'CheckCircle2', title: 'امتحانات إلكترونية', desc: 'تدريب الطلاب على نظام التابلت والامتحانات الرقمية الحديثة.' }
  ],
  facilities: [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
  ],
  contactPhone: "01234567890",
  contactPhoneAlt: "01099887766",
  contactEmail: "info@qa-education.com",
  contactEmailAlt: "support@qa-education.com",
  contactAddress: "القاهرة، مدينة نصر، شارع التعليم",
  aboutTitle: "عن مركز QA التعليمي",
  aboutText: "بدأ المركز رحلته منذ 15 عاماً ليكون المنارة الأولى للطلاب في مصر، نعتمد على أحدث الوسائل التكنولوجية في الشرح والمتابعة.",
  aboutImage: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070&auto=format&fit=crop",
  missionTitle: "رؤيتنا ورسالتنا",
  missionText: "الارتقاء بمستوى الطالب المصري وتوفير كل ما يحتاجه للتفوق في مكان واحد.",
  facebookUrl: "#",
  instagramUrl: "#",
  whatsappUrl: "#"
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/global');
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  try {
    const docRef = doc(db, 'settings', 'global');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/global');
  }
}
