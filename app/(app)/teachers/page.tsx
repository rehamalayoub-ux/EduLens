import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TeacherCard from "./TeacherCard";

const DEMO_TEACHERS = [
  { id: "1", name: "أحمد محمد السالم",    subject: "الرياضيات",         grade_level: "الصف العاشر",      visits: 3, avg_score: 92, status: "completed", photo: "/teachers/teacher-1.svg" },
  { id: "2", name: "فاطمة علي الزهراني",  subject: "العلوم",             grade_level: "الصف الثامن",      visits: 5, avg_score: 87, status: "completed", photo: "/teachers/teacher-2.svg" },
  { id: "3", name: "خالد عبدالله العمري", subject: "اللغة العربية",      grade_level: "الصف الثاني عشر", visits: 2, avg_score: 78, status: "draft",     photo: "/teachers/teacher-3.svg" },
  { id: "4", name: "نورة سعد القحطاني",   subject: "اللغة الإنجليزية",  grade_level: "الصف العاشر",      visits: 4, avg_score: 95, status: "completed", photo: "/teachers/teacher-4.svg" },
  { id: "5", name: "محمد إبراهيم الشمري", subject: "التاريخ",            grade_level: "الصف الحادي عشر", visits: 1, avg_score: null, status: "none",    photo: "/teachers/teacher-5.svg" },
  { id: "6", name: "سلمى عمر البلوي",     subject: "التربية الإسلامية", grade_level: "الصف التاسع",      visits: 6, avg_score: 90, status: "completed", photo: "/teachers/teacher-6.svg" },
];

export default async function TeachersPage() {
  let teachers: typeof DEMO_TEACHERS = DEMO_TEACHERS;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("teachers")
        .select("id, name, subject, grade_level")
        .eq("user_id", user.id)
        .order("name");
      if (data && data.length > 0) {
        teachers = data.map((t: any) => ({
          ...t, visits: 0, avg_score: null, status: "none" as const,
        }));
      }
    }
  } catch {}

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/teachers/new"
          className="bg-[#091426] hover:bg-[#1e293b] text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة معلم جديد
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[#091426]">المعلمون</h1>
          <p className="text-sm text-[#45474c] mt-0.5">{teachers.length} معلم مسجّل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {teachers.map((t) => (
          <TeacherCard key={t.id} teacher={t} />
        ))}
      </div>
    </div>
  );
}
