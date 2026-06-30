import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EvaluationsPage() {
  let evaluations: any[] = [];
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
    evaluations = [
      { id: "e1", teacher_id: "1", date: "2026-06-15", status: "completed", average_score: 4.6, teacher: { id: "1", name: "أحمد محمد السالم",    subject: "الرياضيات"    } },
      { id: "e2", teacher_id: "2", date: "2026-06-22", status: "draft",     average_score: null, teacher: { id: "2", name: "فاطمة علي الزهراني",  subject: "العلوم"       } },
      { id: "e3", teacher_id: "3", date: "2026-06-10", status: "completed", average_score: 3.8, teacher: { id: "3", name: "خالد عبدالله العمري", subject: "اللغة العربية" } },
      { id: "e4", teacher_id: "4", date: "2026-05-28", status: "completed", average_score: 4.2, teacher: { id: "4", name: "نورة سعد القحطاني",   subject: "الفيزياء"     } },
      { id: "e5", teacher_id: "1", date: "2026-05-20", status: "completed", average_score: 4.3, teacher: { id: "1", name: "أحمد محمد السالم",    subject: "الرياضيات"    } },
      { id: "e6", teacher_id: "5", date: "2026-05-12", status: "completed", average_score: 3.5, teacher: { id: "5", name: "محمد إبراهيم الشمري", subject: "التاريخ"      } },
    ];
  }

  // Group by teacher to compute visit counts
  const visitsByTeacher: Record<string, number> = {};
  for (const ev of evaluations) {
    const tid = ev.teacher_id ?? ev.teacher?.id ?? ev.id;
    visitsByTeacher[tid] = (visitsByTeacher[tid] ?? 0) + 1;
  }
  const totalVisits = evaluations.length;

  function levelLabel(score: number | null): { label: string; color: string; bg: string } {
    if (score == null) return { label: "—", color: "#75777d", bg: "#f2f4f6" };
    const pct = score * 20;
    if (pct >= 90) return { label: "ممتاز",      color: "#00a64a", bg: "#dcfce7" };
    if (pct >= 75) return { label: "جيد",         color: "#f59e0b", bg: "#fef3c7" };
    return             { label: "يحتاج تطوير", color: "#ba1a1a", bg: "#fee2e2" };
  }

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#091426]">سجل التقييمات</h1>
          <p className="text-sm text-[#75777d] mt-0.5">إجمالي الزيارات: <span className="font-bold text-[#091426]">{totalVisits}</span></p>
        </div>
        <Link href="/evaluations/new" className="flex items-center gap-2 bg-[#00a64a] hover:bg-[#009040] text-white font-semibold px-5 py-3 rounded-xl transition text-sm">
          <PlusIcon />
          <span>تقييم جديد</span>
        </Link>
      </div>

      {!evaluations || evaluations.length === 0 ? (
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
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c] text-right">عدد الزيارات الصفية</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c] text-right">مستوى المعلم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {(evaluations as any[]).map((ev) => {
                const tid = ev.teacher_id ?? ev.teacher?.id ?? ev.id;
                const visits = visitsByTeacher[tid] ?? 1;
                const lvl = levelLabel(ev.average_score);
                return (
                  <tr key={ev.id} className="hover:bg-[#f7f9fb] transition cursor-pointer">
                    <td className="px-5 py-4">
                      <Link href={`/teachers/${tid}`} className="block group">
                        <p className="font-semibold text-[#091426] text-sm group-hover:text-[#00a64a] transition">{ev.teacher?.name}</p>
                        <p className="text-xs text-[#75777d] mt-0.5">{ev.teacher?.subject}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-[#091426]">{visits}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ color: lvl.color, background: lvl.bg }}
                      >
                        {lvl.label}
                      </span>
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
