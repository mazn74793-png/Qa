export const NAV_LINKS = [
  { name: 'الرئيسية', href: '/' },
  { name: 'عن السنتر', href: '/about' },
  { name: 'المواد الدراسية', href: '/courses' },
  { name: 'المدرسون', href: '/teachers' },
  { name: 'جدول الحصص', href: '/schedule' },
  { name: 'اتصل بنا', href: '/contact' },
];

export const STATS = [
  { label: 'نسبة النجاح', value: '99%' },
  { label: 'طالب متفوق', value: '5000+' },
  { label: 'مدرس خبير', value: '50+' },
  { label: 'سنة خبرة', value: '15+' },
];

export const COURSES = [
  {
    level: 'المرحلة الثانوية',
    subjects: [
      { name: 'اللغة العربية', teacher: 'أ/ محمد علي', price: '200 ج.م' },
      { name: 'الفيزياء', teacher: 'أ/ أحمد سمير', price: '250 ج.م' },
    ]
  },
  {
    level: 'المرحلة الإعدادية',
    subjects: [
      { name: 'العلوم', teacher: 'أ/ سارة محمود', price: '150 ج.م' },
      { name: 'الرياضيات', teacher: 'أ/ إبراهيم حسن', price: '150 ج.م' },
    ]
  }
];
