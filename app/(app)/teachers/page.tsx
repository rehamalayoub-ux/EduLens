import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEMO_TEACHERS } from "@/lib/demo-data";
import TeachersList from "./TeachersList";

export default async function TeachersPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("x-demo-session")?.value === "1";

  let teachers: typeof DEMO_TEACHERS = [];

  if (isDemo) {
    teachers = DEMO_TEACHERS;
  } else {
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
        } else {
          teachers = DEMO_TEACHERS;
        }
      }
    } catch {
      teachers = DEMO_TEACHERS;
    }
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/teachers/new"
          className="bg-[#091426] hover:bg-[#1e293b] text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          إضافة معلم جديد
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[#091426]">المعلمون</h1>
          <p className="text-sm text-[#45474c] mt-0.5">{teachers.length} معلم مسجّل</p>
        </div>
      </div>
      <TeachersList teachers={teachers} isDemo={isDemo} />
    </div>
  );
}
