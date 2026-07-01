import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DEMO_EVALUATIONS, DEMO_TEACHERS } from "@/lib/demo-data";

export default async function EvaluationsPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("x-demo-session")?.value === "1";

  let evaluations: any[] = [];

  if (isDemo) {
    evaluations = DEMO_EVALUATIONS.map(e => {
      const teacher = DEMO_TEACHERS.find(t => t.id === e.teacher_id);
      return { ...e, teacher: teacher ? { id: teacher.id, name: teacher.name, subject: teacher.subject } : null };
    });
  } else {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) redirect("/login");
      const { data } = await supabase
        .from("evaluations")
        .select("*, teacher:teachers(id, name, subject)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      evaluations = data ?? [];
    } catch {
      redirect("/login");
    }
  }

  const visitsByTeacher: Record<string, number> = {};
  for (const ev of evaluations) {
    const tid = ev.teacher_id ?? ev.teacher?.id;
    if (tid) visitsByTeacher[tid] = (visitsByTeacher[tid] ?? 0) + 1;
  }
  const totalVisits = evaluations.length;

  function levelLabel(score: number | null): { label: string; color: string; bg: string } {
    if (score == null) return { label: "—", color: "#75777d", bg: "#f2f4f6" };
    const pct = score * 20;
    if (pct >= 90) return { label: "ممتاز",      color: "#00a64a", bg: "#dcfce7" };
    if (pct >= 75) return { label: "جيد",         color: "#f59e0b", bg: "#fef3c7" };
    return             { label: "يحتاج تطوير", color: "#ba1a1a", bg: "#fee2e2" };
  }

  function formatDate(d: string) {
    try { return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return d; }
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#091426]">سجل التقييمات</h1>
          <p className="text-sm text-[#75777d] mt-0.5">إجمالي الزيارات: <span className="font-bold text-[#091426]">{totalVisits}</span></p>
        </div>
        {!isDemo && (
          <Link href="/evaluations/new" className="flex items-center gap-2 bg-[#00a64a] hover:bg-[#009040] text-white font-semibold px-5 py-3 rounded-xl transition text-sm">
            <PlusIcon />
            <span>تقييم جديد</span>
          </Link>
        )}
      </div>

      {evaluations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] py-20 text-center shadow-sm">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[#45474c] font-medium mb-1">لا توجد تقييمات بعد</p>
          <p className="text-sm text-[#75777d] mb-6">ابدأ بإنشاء أول تقييم</p>
          <Link href="/evaluations/new" className="inline-flex items-center gap-2 bg-[#091426] text-white px-5 py-3 rounded-xl text-sm font-semibold">
            تقييم جديد
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-[#f7f9fb] border-b border-[#e0e3e5]">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c] text-right">اسم المعلم</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c] text-right">موضوع الدرس</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c] text-right">التاريخ</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c] text-right">مستوى المعلم</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c] text-right">التقرير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {evaluations.map((ev) => {
                const tid = ev.teacher_id ?? ev.teacher?.id;
                const lvl = levelLabel(ev.average_score);
                return (
                  <tr key={ev.id} className="hover:bg-[#f7f9fb] transition">
                    <td className="px-5 py-4">
                      <Link href={`/teachers/${tid}`} className="block group">
                        <p className="font-semibold text-[#091426] text-sm group-hover:text-[#00a64a] transition">{ev.teacher?.name ?? "—"}</p>
                        <p className="text-xs text-[#75777d] mt-0.5">{ev.teacher?.subject ?? ""}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-[#191c1e]">{ev.lesson_topic ?? "—"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-[#45474c] whitespace-nowrap">{ev.date ? formatDate(ev.date) : "—"}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ev.status === "completed" ? "bg-[#dcfce7] text-[#00a64a]" : "bg-[#fff3cd] text-[#92600a]"}`}>
                        {ev.status === "completed" ? "مكتمل" : "مسودة"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ color: lvl.color, background: lvl.bg }}>
                        {lvl.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/evaluations/${ev.id}`}
                        className="w-8 h-8 rounded-lg bg-[#f2f4f6] hover:bg-[#091426] hover:text-white text-[#45474c] flex items-center justify-center transition"
                        title="عرض التقرير">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
