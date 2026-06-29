import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { RUBRIC_CATEGORIES } from "@/lib/rubric";
import Link from "next/link";
import PrintButton from "./PrintButton";
import DeleteEvaluationButton from "./DeleteEvaluationButton";
import EditCommentsForm from "./EditCommentsForm";

export default async function EvaluationReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ev } = await supabase
    .from("evaluations")
    .select("*, teacher:teachers(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!ev) notFound();

  const scoreEntries = RUBRIC_CATEGORIES.map((cat) => ({
    title: cat.title,
    score: (ev as any)[cat.key] as number | null,
  }));

  const filledScores = scoreEntries.filter((s) => s.score !== null);
  const totalScore = filledScores.reduce((acc, s) => acc + (s.score ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto print:max-w-none">
      {/* Header actions - hidden on print */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex gap-3">
          <DeleteEvaluationButton id={ev.id} />
          <PrintButton />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/evaluations" className="text-sm text-[#45474c] hover:text-[#091426] px-4 py-2 rounded-lg hover:bg-[#f2f4f6] transition">
            → العودة للسجل
          </Link>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            ev.status === "completed" ? "bg-[#dcfce7] text-[#00a64a]" : "bg-[#f2f4f6] text-[#45474c]"
          }`}>
            {ev.status === "completed" ? "مكتمل" : "مسودة"}
          </span>
          <h1 className="text-xl font-bold text-[#091426]">تقرير تقييم الحصة</h1>
        </div>
      </div>

      {/* Teacher & Lesson Info */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5">
        <h2 className="text-base font-semibold text-[#091426] text-right mb-4 pb-3 border-b border-[#e0e3e5]">معلومات الحصة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
          <InfoRow label="اسم المعلم" value={(ev.teacher as any)?.name} />
          <InfoRow label="المادة الدراسية" value={ev.subject} />
          <InfoRow label="الصف / الشعبة" value={ev.grade_level} />
          <InfoRow label="موضوع الدرس" value={ev.lesson_topic} />
          <InfoRow label="تاريخ الزيارة" value={new Date(ev.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })} />
          <InfoRow label="المعدل الكلي" value={ev.average_score != null ? `${Number(ev.average_score).toFixed(1)} / 5` : "-"} highlight />
        </div>
      </div>

      {/* Rubric Scores */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5">
        <h2 className="text-base font-semibold text-[#091426] text-right mb-4 pb-3 border-b border-[#e0e3e5]">نتائج بطاقة التقييم</h2>
        <div className="space-y-3">
          {scoreEntries.map((item) => (
            <div key={item.title} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                  {item.score != null ? `${item.score} / 5` : "-"}
                </span>
                <div className="w-24 bg-[#e0e3e5] rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-[#091426] transition-all"
                    style={{ width: item.score != null ? `${(item.score / 5) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <p className="text-sm text-[#191c1e] text-right">{item.title}</p>
            </div>
          ))}
          <div className="pt-3 border-t border-[#e0e3e5] flex items-center justify-between">
            <span className="text-base font-bold text-[#091426]">{totalScore} / {RUBRIC_CATEGORIES.length * 5}</span>
            <span className="text-sm font-semibold text-[#45474c]">المجموع الكلي</span>
          </div>
        </div>
      </div>

      {/* Observation Notes */}
      {ev.observation_notes && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#091426] text-right mb-3">ملاحظات المشرف</h2>
          <p className="text-sm text-[#45474c] text-right leading-relaxed whitespace-pre-wrap">{ev.observation_notes}</p>
        </div>
      )}

      {/* AI Feedback */}
      {ev.ai_summary && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5 border-r-4 border-r-[#75777d]">
          <h2 className="text-base font-semibold text-[#091426] text-right mb-3 flex items-center justify-end gap-2">
            <span>ملخص الزيارة</span><span>📋</span>
          </h2>
          <p className="text-sm text-[#45474c] text-right leading-relaxed whitespace-pre-wrap">{ev.ai_summary}</p>
        </div>
      )}

      {ev.ai_strengths && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5 border-r-4 border-r-[#00a64a]">
          <h2 className="text-base font-semibold text-[#091426] text-right mb-3 flex items-center justify-end gap-2">
            <span>نقاط القوة</span><span>💪</span>
          </h2>
          <p className="text-sm text-[#45474c] text-right leading-relaxed whitespace-pre-wrap">{ev.ai_strengths}</p>
        </div>
      )}

      {ev.ai_improvement_areas && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5 border-r-4 border-r-[#f59e0b]">
          <h2 className="text-base font-semibold text-[#091426] text-right mb-3 flex items-center justify-end gap-2">
            <span>مجالات التحسين</span><span>📈</span>
          </h2>
          <p className="text-sm text-[#45474c] text-right leading-relaxed whitespace-pre-wrap">{ev.ai_improvement_areas}</p>
        </div>
      )}

      {ev.ai_recommendations && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5 border-r-4 border-r-[#091426]">
          <h2 className="text-base font-semibold text-[#091426] text-right mb-3 flex items-center justify-end gap-2">
            <span>التوصيات العملية</span><span>🎯</span>
          </h2>
          <p className="text-sm text-[#45474c] text-right leading-relaxed whitespace-pre-wrap">{ev.ai_recommendations}</p>
        </div>
      )}

      {ev.ai_professional_development_plan && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5 border-r-4 border-r-[#7c3aed]">
          <h2 className="text-base font-semibold text-[#091426] text-right mb-3 flex items-center justify-end gap-2">
            <span>خطة التطوير المهني</span><span>🗺️</span>
          </h2>
          <p className="text-sm text-[#45474c] text-right leading-relaxed whitespace-pre-wrap">{ev.ai_professional_development_plan}</p>
        </div>
      )}

      {/* Final Comments */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5">
        <h2 className="text-base font-semibold text-[#091426] text-right mb-4">التعليقات الختامية للمشرف</h2>
        <EditCommentsForm evaluationId={ev.id} initialComments={ev.final_comments ?? ""} />
      </div>

      <p className="text-center text-xs text-[#75777d] mt-6 print:block">
        تقرير صادر من منصة EduLens — إديو لينس © 2024
      </p>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-right">
      <p className="text-xs text-[#75777d] mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-[#00a64a] text-base" : "text-[#191c1e]"}`}>{value ?? "-"}</p>
    </div>
  );
}

function getScoreColor(score: number | null) {
  if (score == null) return "text-[#75777d]";
  if (score >= 4) return "text-[#00a64a]";
  if (score >= 3) return "text-[#f59e0b]";
  return "text-[#ba1a1a]";
}
