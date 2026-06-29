import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeleteTeacherButton from "./DeleteTeacherButton";

export default async function TeachersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: teachers } = await supabase
    .from("teachers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#091426]">المعلمون</h1>
        <Link
          href="/teachers/new"
          className="flex items-center gap-2 bg-[#091426] hover:bg-[#1e293b] text-white font-semibold px-5 py-3 rounded-xl transition text-sm"
        >
          <PlusIcon />
          <span>إضافة معلم</span>
        </Link>
      </div>

      {!teachers || teachers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] py-20 text-center shadow-sm">
          <div className="text-5xl mb-4">👨‍🏫</div>
          <p className="text-[#45474c] font-medium mb-1">لا يوجد معلمون بعد</p>
          <p className="text-sm text-[#75777d] mb-6">أضف أول معلم لبدء التقييمات</p>
          <Link
            href="/teachers/new"
            className="inline-flex items-center gap-2 bg-[#091426] text-white px-5 py-3 rounded-xl text-sm font-semibold"
          >
            <PlusIcon />
            إضافة معلم
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] overflow-hidden shadow-sm">
          <div className="divide-y divide-[#e0e3e5]">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#f7f9fb] transition">
                <div className="flex items-center gap-3">
                  <DeleteTeacherButton id={teacher.id} />
                  <Link
                    href={`/teachers/${teacher.id}/edit`}
                    className="text-sm text-[#45474c] hover:text-[#091426] transition px-3 py-1.5 rounded-lg hover:bg-[#eceef0]"
                  >
                    تعديل
                  </Link>
                </div>
                <div className="flex items-center gap-6 text-sm text-[#45474c]">
                  <span>{teacher.grade_level}</span>
                  <span>{teacher.subject}</span>
                  <span className="text-xs text-[#75777d]">{teacher.school_department}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#091426]">{teacher.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
