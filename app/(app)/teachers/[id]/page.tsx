import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import TeacherProfileAvatar from "./TeacherProfileAvatar";
import { formatDateAr } from "@/lib/formatDate";
import { DEMO_TEACHERS, DEMO_TEACHER_PROFILES } from "@/lib/demo-data";

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("x-demo-session")?.value === "1";

  let teacher: any = null;

  if (isDemo) {
    const dt = DEMO_TEACHERS.find(t => t.id === id);
    const profile = DEMO_TEACHER_PROFILES[id];
    if (dt && profile) {
      teacher = { ...dt, total_visits: dt.visits, avg_score: dt.avg_score, ...profile };
    }
  } else {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: t } = await supabase.from("teachers").select("*").eq("id", id).single();
        if (t) {
          const { data: evals } = await supabase
            .from("evaluations")
            .select("*")
            .eq("teacher_id", id)
            .order("date", { ascending: false });
          const completed = evals?.filter((e: any) => e.status === "completed") ?? [];
          const scores = completed.map((e: any) => e.average_score).filter(Boolean);
          const avgScore = scores.length ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 20) : null;
          teacher = {
            ...t,
            total_visits: evals?.length ?? 0,
            avg_score: avgScore,
            ai_report: null,
            visits: (evals ?? []).map((e: any) => ({
              id: e.id,
              date: e.date ? formatDateAr(e.date) : "—",
              topic: e.lesson_topic ?? "—",
              score: e.average_score ? Math.round(e.average_score * 20) : null,
              status: e.status === "completed" ? "مكتمل" : "مسودة",
            })),
          };
        }
      }
    } catch {}
  }

  if (!teacher) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-[#45474c]">لم يتم العثور على المعلم</p>
        <Link href="/teachers" className="mt-4 inline-block text-sm text-[#091426] underline">العودة للمعلمين</Link>
      </div>
    );
  }

  const initials = teacher.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("");
  const aiReport = teacher.ai_report;

  return (
    <div className="max-w-4xl" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          {!isDemo && (
            <>
              <Link href={`/evaluations/new?teacher=${teacher.id}`}
                className="bg-[#00a64a] hover:bg-[#009040] text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                تقييم جديد
              </Link>
              <Link href={`/teachers/${teacher.id}/edit`}
                className="border border-[#c5c6cd] text-[#45474c] text-sm px-4 py-2 rounded-xl hover:bg-[#f2f4f6] transition">
                تعديل
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h1 className="text-xl font-bold text-[#091426]">{teacher.name}</h1>
            <p className="text-sm text-[#45474c]">{teacher.subject} — {teacher.grade_level}</p>
          </div>
          <TeacherProfileAvatar initials={initials} defaultPhoto={teacher.photo ?? null} />
          <Link href="/teachers" className="flex items-center gap-1 text-sm text-[#45474c] hover:text-[#091426] border border-[#c5c6cd] px-3 py-2 rounded-xl hover:bg-[#f2f4f6] transition">
            العودة
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-[#091426]">{teacher.total_visits}</p>
          <p className="text-xs text-[#45474c] mt-1">إجمالي الزيارات</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-[#00a64a]">{teacher.avg_score ? `${teacher.avg_score}%` : "—"}</p>
          <p className="text-xs text-[#45474c] mt-1">متوسط التقييم الكلي</p>
        </div>
      </div>

      {/* AI Report */}
      {aiReport && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5">
          <div className="flex items-center justify-end gap-2 mb-4 pb-3 border-b border-[#f2f4f6]">
            <h2 className="text-base font-bold text-[#091426]">تقرير الأداء بالذكاء الاصطناعي</h2>
            <span className="bg-[#dcfce7] text-[#00a64a] text-[10px] font-bold px-2.5 py-1 rounded-full">🤖 مولّد تلقائياً</span>
          </div>

          <div className="bg-[#f7f9fb] rounded-xl p-4 mb-4 border-r-4 border-r-[#091426]">
            <p className="text-xs font-bold text-[#75777d] mb-2">ملخص عام</p>
            <p className="text-sm text-[#191c1e] leading-relaxed text-right">{aiReport.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiReport.strengths.length > 0 && (
              <div className="bg-[#f0fdf4] rounded-xl p-4 border border-[#dcfce7]">
                <p className="text-xs font-bold text-[#00a64a] mb-2 flex items-center gap-1 justify-end">✅ نقاط القوة</p>
                <ul className="space-y-1.5">
                  {aiReport.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#191c1e] text-right flex items-start gap-2">
                      <span>{s}</span><span className="text-[#00a64a] shrink-0">•</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {aiReport.improvements.length > 0 && (
              <div className="bg-[#fffbeb] rounded-xl p-4 border border-[#fde68a]">
                <p className="text-xs font-bold text-[#92600a] mb-2 flex items-center gap-1 justify-end">📈 مجالات التطوير</p>
                <ul className="space-y-1.5">
                  {aiReport.improvements.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#191c1e] text-right flex items-start gap-2">
                      <span>{s}</span><span className="text-[#f59e0b] shrink-0">•</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {aiReport.recommendations.length > 0 && (
              <div className="bg-[#f0f4ff] rounded-xl p-4 border border-[#c7d2fe]">
                <p className="text-xs font-bold text-[#3b5bdb] mb-2 flex items-center gap-1 justify-end">🎯 التوصيات</p>
                <ul className="space-y-1.5">
                  {aiReport.recommendations.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#191c1e] text-right flex items-start gap-2">
                      <span>{s}</span><span className="text-[#3b5bdb] shrink-0">•</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {aiReport.development_plan && (
              <div className="bg-[#f5f3ff] rounded-xl p-4 border border-[#ddd6fe]">
                <p className="text-xs font-bold text-[#7c3aed] mb-2 flex items-center gap-1 justify-end">🗺️ خطة التطوير</p>
                <p className="text-sm text-[#191c1e] text-right leading-relaxed">{aiReport.development_plan}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f2f4f6] flex items-center justify-end">
          <h2 className="font-bold text-[#091426]">سجل الزيارات</h2>
        </div>
        {teacher.visits.length === 0 ? (
          <div className="py-12 text-center text-[#75777d] text-sm">لا توجد زيارات مسجلة بعد</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f9fb] border-b border-[#e0e3e5]">
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#45474c]">#</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#45474c]">التاريخ</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#45474c]">موضوع الدرس</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#45474c]">التقييم</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#45474c]">التقرير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4f6]">
              {teacher.visits.map((v: any, i: number) => (
                <tr key={i} className="hover:bg-[#f7f9fb] transition">
                  <td className="px-5 py-4">
                    <div className="w-7 h-7 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#75777d] text-xs font-bold">{i + 1}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#45474c] text-right whitespace-nowrap">{v.date}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-[#091426] text-right">{v.topic}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${v.status === "مكتمل" ? "bg-[#dcfce7] text-[#00a64a]" : "bg-[#fff3cd] text-[#92600a]"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${v.score ? (v.score >= 90 ? "text-[#00a64a]" : v.score >= 75 ? "text-[#f59e0b]" : "text-[#ba1a1a]") : "text-[#c5c6cd]"}`}>
                      {v.score ? `${v.score}%` : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/evaluations/${v.id}`}
                      className="w-8 h-8 rounded-lg bg-[#f2f4f6] hover:bg-[#091426] hover:text-white text-[#45474c] flex items-center justify-center transition"
                      title="عرض التقرير">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
