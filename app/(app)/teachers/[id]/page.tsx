import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TeacherProfileAvatar from "./TeacherProfileAvatar";
import { formatDateAr } from "@/lib/formatDate";

const DEMO_TEACHERS: Record<string, any> = {
  "1": {
    id: "1", name: "أحمد محمد السالم", subject: "الرياضيات", grade_level: "الصف العاشر", photo: "/teachers/teacher-1.svg",
    total_visits: 3, avg_score: 90,
    ai_report: {
      summary: "يُظهر المعلم أحمد محمد السالم مستوىً مرتفعاً من الكفاءة التدريسية، يتجلى في وضوح الشرح وتنوع الاستراتيجيات المستخدمة. أثبتت زياراته الثلاث تحسناً تدريجياً ملحوظاً في إدارة الوقت والتفاعل مع الطلاب.",
      strengths: ["وضوح الشرح وربط المفاهيم بالحياة اليومية", "إدارة الصف بهدوء ومهنية عالية", "تنوع الاستراتيجيات التدريسية"],
      improvements: ["تعزيز مشاركة الطلبة التفاعلية", "الاهتمام بالتقويم المستمر خلال الدرس"],
      recommendations: ["تطبيق استراتيجية التعلم التعاوني", "تخصيص 5 دقائق للتقويم الختامي في كل حصة"],
      development_plan: "يُنصح بحضور ورشة عمل في استراتيجيات التقويم البنائي خلال الفصل القادم.",
    },
    visits: [
      { id: "e1", date: "15 يونيو 2026", topic: "المعادلات التربيعية", score: 92, status: "مكتمل" },
      { id: "e2", date: "28 مايو 2026",  topic: "الدوال والمشتقات",   score: 88, status: "مكتمل" },
      { id: "e3", date: "10 مايو 2026",  topic: "حساب المثلثات",      score: 85, status: "مكتمل" },
    ],
  },
  "2": {
    id: "2", name: "فاطمة علي الزهراني", subject: "العلوم", grade_level: "الصف الثامن", photo: "/teachers/teacher-2.svg",
    total_visits: 5, avg_score: 88,
    ai_report: {
      summary: "تمتلك المعلمة فاطمة علي الزهراني كفاءة عالية في توظيف التجارب العملية وإدارة بيئة صفية داعمة. تشير سجلات الزيارات إلى أداء متميز وثابت مع فرصة لتعزيز أسئلة التفكير الناقد.",
      strengths: ["توظيف ممتاز للتجارب العلمية العملية", "بيئة صفية داعمة ومحفزة"],
      improvements: ["تنظيم الوقت بين مراحل الدرس", "تعزيز أسئلة التفكير الناقد"],
      recommendations: ["اعتماد خطة تقسيم وقت الحصة (15-25-10) دقيقة"],
      development_plan: "التركيز في الفصل القادم على استراتيجيات التفكير العلمي.",
    },
    visits: [
      { id: "e4", date: "20 يونيو 2026", topic: "الخلية الحية",        score: 87, status: "مكتمل" },
      { id: "e5", date: "5 يونيو 2026",  topic: "المركبات الكيميائية", score: 90, status: "مكتمل" },
    ],
  },
};

function getDemo(id: string) {
  return DEMO_TEACHERS[id] ?? {
    id, name: "معلم تجريبي", subject: "المادة", grade_level: "الصف العاشر",
    total_visits: 0, avg_score: null,
    ai_report: { summary: "لم يتم توليد تقرير بعد.", strengths: [], improvements: [], recommendations: [], development_plan: "" },
    visits: [],
  };
}

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let teacher = getDemo(id);

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
          ai_report: teacher.ai_report,
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

  const initials = teacher.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("");

  return (
    <div className="max-w-4xl" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <Link href={`/evaluations/new?teacher=${teacher.id}`}
            className="bg-[#00a64a] hover:bg-[#009040] text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
            تقييم جديد
          </Link>
          <Link href={`/teachers/${teacher.id}/edit`}
            className="border border-[#c5c6cd] text-[#45474c] text-sm px-4 py-2 rounded-xl hover:bg-[#f2f4f6] transition">
            تعديل
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h1 className="text-xl font-bold text-[#091426]">{teacher.name}</h1>
            <p className="text-sm text-[#45474c]">{teacher.subject} — {teacher.grade_level}</p>
          </div>
          <TeacherProfileAvatar initials={initials} defaultPhoto={teacher.photo} />
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
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5">
        <div className="flex items-center justify-end gap-2 mb-4 pb-3 border-b border-[#f2f4f6]">
          <h2 className="text-base font-bold text-[#091426]">تقرير الأداء بالذكاء الاصطناعي</h2>
          <span className="bg-[#dcfce7] text-[#00a64a] text-[10px] font-bold px-2.5 py-1 rounded-full">✨ مولّد تلقائياً</span>
        </div>

        {/* Summary */}
        <div className="bg-[#f7f9fb] rounded-xl p-4 mb-4 border-r-4 border-r-[#091426]">
          <p className="text-xs font-bold text-[#75777d] mb-2">ملخص عام</p>
          <p className="text-sm text-[#191c1e] leading-relaxed text-right">{teacher.ai_report.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teacher.ai_report.strengths.length > 0 && (
            <div className="bg-[#f0fdf4] rounded-xl p-4 border border-[#dcfce7]">
              <p className="text-xs font-bold text-[#00a64a] mb-2 flex items-center gap-1 justify-end">✅ نقاط القوة</p>
              <ul className="space-y-1.5">
                {teacher.ai_report.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-[#191c1e] text-right flex items-start gap-2">
                    <span>{s}</span>
                    <span className="text-[#00a64a] shrink-0">•</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {teacher.ai_report.improvements.length > 0 && (
            <div className="bg-[#fffbeb] rounded-xl p-4 border border-[#fde68a]">
              <p className="text-xs font-bold text-[#92600a] mb-2 flex items-center gap-1 justify-end">📈 مجالات التطوير</p>
              <ul className="space-y-1.5">
                {teacher.ai_report.improvements.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-[#191c1e] text-right flex items-start gap-2">
                    <span>{s}</span>
                    <span className="text-[#f59e0b] shrink-0">•</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {teacher.ai_report.recommendations.length > 0 && (
            <div className="bg-[#f0f4ff] rounded-xl p-4 border border-[#c7d2fe]">
              <p className="text-xs font-bold text-[#3b5bdb] mb-2 flex items-center gap-1 justify-end">🎯 التوصيات</p>
              <ul className="space-y-1.5">
                {teacher.ai_report.recommendations.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-[#191c1e] text-right flex items-start gap-2">
                    <span>{s}</span>
                    <span className="text-[#3b5bdb] shrink-0">•</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {teacher.ai_report.development_plan && (
            <div className="bg-[#f5f3ff] rounded-xl p-4 border border-[#ddd6fe]">
              <p className="text-xs font-bold text-[#7c3aed] mb-2 flex items-center gap-1 justify-end">🗺️ خطة التطوير</p>
              <p className="text-sm text-[#191c1e] text-right leading-relaxed">{teacher.ai_report.development_plan}</p>
            </div>
          )}
        </div>
      </div>

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
                <th className="px-5 py-3 text-right text-xs font-semibold text-[#45474c]">تحميل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f4f6]">
              {teacher.visits.map((v: any, i: number) => (
                <tr key={i} className="hover:bg-[#f7f9fb] transition">
                  <td className="px-5 py-4">
                    <div className="w-7 h-7 rounded-full bg-[#f2f4f6] flex items-center justify-center text-[#75777d] text-xs font-bold">
                      {i + 1}
                    </div>
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
                      title="عرض وتحميل التقرير">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
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
