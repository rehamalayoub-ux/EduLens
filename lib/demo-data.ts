export const DEMO_TEACHERS = [
  { id: "d1", name: "أحمد محمد السالم",    subject: "الرياضيات",           grade_level: "الصف العاشر",      visits: 3, avg_score: 92, status: "completed" },
  { id: "d2", name: "فاطمة علي الزهراني",  subject: "العلوم",               grade_level: "الصف الثامن",      visits: 1, avg_score: null, status: "draft" },
  { id: "d3", name: "خالد عبدالله العمري", subject: "اللغة العربية",        grade_level: "الصف الثاني عشر", visits: 2, avg_score: 76, status: "completed" },
  { id: "d4", name: "نورة سعد القحطاني",   subject: "اللغة الإنجليزية",    grade_level: "الصف العاشر",      visits: 4, avg_score: 95, status: "completed" },
  { id: "d5", name: "محمد إبراهيم الشمري", subject: "التاريخ",              grade_level: "الصف الحادي عشر", visits: 1, avg_score: null, status: "none" },
  { id: "d6", name: "سلمى عمر البلوي",     subject: "التربية الإسلامية",   grade_level: "الصف التاسع",      visits: 6, avg_score: 90, status: "completed" },
];

export const DEMO_EVALUATIONS = [
  { id: "e1", teacher_id: "d1", status: "completed", date: "2026-06-15", average_score: 4.6, lesson_topic: "المعادلات التربيعية" },
  { id: "e2", teacher_id: "d1", status: "completed", date: "2026-05-20", average_score: 4.3, lesson_topic: "الدوال والعلاقات" },
  { id: "e3", teacher_id: "d1", status: "completed", date: "2026-04-10", average_score: 4.7, lesson_topic: "التفاضل والتكامل" },
  { id: "e4", teacher_id: "d2", status: "draft",     date: "2026-06-22", average_score: null, lesson_topic: "الخلية وأجزاؤها" },
  { id: "e5", teacher_id: "d3", status: "completed", date: "2026-06-10", average_score: 3.8, lesson_topic: "أساليب النداء والاستفهام" },
  { id: "e6", teacher_id: "d3", status: "completed", date: "2026-05-05", average_score: 3.8, lesson_topic: "البلاغة والبيان" },
  { id: "e7", teacher_id: "d4", status: "completed", date: "2026-06-18", average_score: 4.9, lesson_topic: "Reading Comprehension" },
  { id: "e8", teacher_id: "d4", status: "completed", date: "2026-06-01", average_score: 4.8, lesson_topic: "Grammar: Present Perfect" },
  { id: "e9", teacher_id: "d4", status: "completed", date: "2026-05-15", average_score: 4.7, lesson_topic: "Writing Skills" },
  { id: "e10",teacher_id: "d4", status: "completed", date: "2026-04-20", average_score: 4.8, lesson_topic: "Vocabulary Building" },
  { id: "e11",teacher_id: "d5", status: "completed", date: "2026-06-05", average_score: null, lesson_topic: "الحرب العالمية الأولى" },
  { id: "e12",teacher_id: "d6", status: "completed", date: "2026-06-20", average_score: 4.5, lesson_topic: "أركان الإسلام" },
  { id: "e13",teacher_id: "d6", status: "completed", date: "2026-05-10", average_score: 4.7, lesson_topic: "السيرة النبوية" },
  { id: "e14",teacher_id: "d6", status: "completed", date: "2026-04-15", average_score: 4.4, lesson_topic: "الفقه الإسلامي" },
  { id: "e15",teacher_id: "d6", status: "completed", date: "2026-03-10", average_score: 4.6, lesson_topic: "التفسير القرآني" },
  { id: "e16",teacher_id: "d6", status: "completed", date: "2026-02-20", average_score: 4.5, lesson_topic: "الأخلاق والقيم" },
  { id: "e17",teacher_id: "d6", status: "completed", date: "2026-01-15", average_score: 4.3, lesson_topic: "العقيدة الإسلامية" },
];
