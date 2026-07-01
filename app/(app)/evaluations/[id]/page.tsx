import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { RUBRIC_CATEGORIES } from "@/lib/rubric";
import Link from "next/link";
import PrintButton from "./PrintButton";
import { formatDateAr } from "@/lib/formatDate";
import DeleteEvaluationButton from "./DeleteEvaluationButton";
import EditCommentsForm from "./EditCommentsForm";
import { DEMO_EVALUATIONS, DEMO_TEACHERS } from "@/lib/demo-data";

export default async function EvaluationReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("x-demo-session")?.value === "1";

  let ev: any = null;

  if (isDemo) {
    const demoEv = DEMO_EVALUATIONS.find(e => e.id === id);
    if (demoEv) {
      const teacher = DEMO_TEACHERS.find(t => t.id === demoEv.teacher_id);
      ev = { ...demoEv, teacher, subject: teacher?.subject, grade_level: teacher?.grade_level };
    }
  } else {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) redirect("/login");
      const { data } = await supabase
        .from("evaluations")
        .select("*, teacher:teachers(*)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      ev = data;
    } catch {}
  }

  if (!ev) notFound();

  const scoreEntries = RUBRIC_CATEGORIES.map((cat) => ({
    title: cat.title,
    score: (ev as any)[cat.key] as number | null,
  }));

  const filledScores = scoreEntries.filter((s) => s.score !== null);
  const totalScore = filledScores.reduce((acc, s) => acc + (s.score ?? 0), 0);

  const hasAI = ev.ai_summary || ev.ai_strengths || ev.ai_improvement_areas || ev.ai_recommendations || ev.ai_professional_development_plan;

  return (
    <div className="max-w-4xl mx-auto print:max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex gap-3">
          {!isDemo && <DeleteEvaluationButton id={ev.id} />}
          <PrintButton />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/evaluations" className="text-sm text-[#45474c] hover:text-[#091426] px-4 py-2 rounded-lg hover:bg-[#f2f4f6] transition flex items-center gap-1">
            العودة للسجل
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
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
          <InfoRow label="اسم المعلم"      value={(ev.teacher as any)?.name} />
          <InfoRow label="المادة الدراسية" value={ev.subject ?? ev.teacher?.subject} />
          <InfoRow label="الصف / الشعبة"   value={ev.grade_level ?? ev.teacher?.grade_level} />
          <InfoRow label="موضوع الدرس"     value={ev.lesson_topic} />
          <InfoRow label="تاريخ الزيارة"   value={formatDateAr(ev.date)} />
          <InfoRow label="المعدل الكلي"     value={ev.average_score != null ? `${Number(ev.average_score).toFixed(1)} / 5` : "-"} highlight />
        </div>
      </div>

      {/* AI Feedback — shown prominently for demo */}
      {hasAI && (
        <div className="mb-5">
          <div className="flex items-center justify-end gap-2 mb-3">
            <h2 className="text-lg font-bold text-[#091426]">تقرير الذكاء الاصطناعي</h2>
            <span className="bg-[#dcfce7] text-[#00a64a] text-[10px] font-bold px-2.5 py-1 rounded-full">🤖 مولّد تلقائياً</span>
          </div>

          {ev.ai_summary && (
            <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-5 mb-3 border-r-4 border-r-[#091426]">
              <p className="text-xs font-bold text-[#75777d] mb-2 text-right flex items-center justify-end gap-1">📋 ملخص الزيارة</p>
              <p className="text-sm text-[#45474c] text-right leading-relaxed whitespace-pre-wrap">{ev.ai_summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {ev.ai_strengths && (
              <div className="bg-white rounded-2xl border border-[#dcfce7] shadow-sm p-5 border-r-4 border-r-[#00a64a]">
                <p className="text-xs font-bold text-[#00a64a] mb-3 text-right flex items-center justify-end gap-1">💪 نقاط القوة</p>
                <ul className="space-y-2">
                  {ev.ai_strengths.split("\n").filter(Boolean).map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#191c1e] text-right flex items-start gap-2">
                      <span className="flex-1">{s}</span>
                      <span className="text-[#00a64a] shrink-0 mt-0.5">✓</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ev.ai_improvement_areas && (
              <div className="bg-white rounded-2xl border border-[#fde68a] shadow-sm p-5 border-r-4 border-r-[#f59e0b]">
                <p className="text-xs font-bold text-[#92600a] mb-3 text-right flex items-center justify-end gap-1">📈 مجالات التحسين</p>
                <ul className="space-y-2">
                  {ev.ai_improvement_areas.split("\n").filter(Boolean).map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#191c1e] text-right flex items-start gap-2">
                      <span className="flex-1">{s}</span>
                      <span className="text-[#f59e0b] shrink-0 mt-0.5">→</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ev.ai_recommendations && (
              <div className="bg-white rounded-2xl border border-[#c7d2fe] shadow-sm p-5 border-r-4 border-r-[#2563eb]">
                <p className="text-xs font-bold text-[#3b5bdb] mb-3 text-right flex items-center justify-end gap-1">🎯 التوصيات العملية</p>
                <ul className="space-y-2">
                  {ev.ai_recommendations.split("\n").filter(Boolean).map((s: string, i: number) => (
                    <li key={i} className="text-sm text-[#191c1e] text-right flex items-start gap-2">
                      <span className="flex-1">{s}</span>
                      <span className="text-[#2563eb] shrink-0 mt-0.5">•</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ev.ai_professional_development_plan && (
              <div className="bg-white rounded-2xl border border-[#ddd6fe] shadow-sm p-5 border-r-4 border-r-[#7c3aed]">
                <p className="text-xs font-bold text-[#7c3aed] mb-2 text-right flex items-center justify-end gap-1">🗺️ خطة التطوير المهني</p>
                <p className="text-sm text-[#45474c] text-right leading-relaxed whitespace-pre-wrap">{ev.ai_professional_development_plan}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rubric Scores */}
      {filledScores.length > 0 && (
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
                    <div className="h-2 rounded-full bg-[#091426] transition-all"
                      style={{ width: item.score != null ? `${(item.score / 5) * 100}%` : "0%" }} />
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
      )}

      {/* Observation Notes */}
      {ev.observation_notes && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#091426] text-right mb-3">ملاحظات المشرف</h2>
          <p className="text-sm text-[#45474c] text-right leading-relaxed whitespace-pre-wrap">{ev.observation_notes}</p>
        </div>
      )}

      {/* Final Comments */}
      {!isDemo && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 mb-5">
          <h2 className="text-base font-semibold text-[#091426] text-right mb-4">التعليقات الختامية للمشرف</h2>
          <EditCommentsForm evaluationId={ev.id} initialComments={ev.final_comments ?? ""} />
        </div>
      )}

      {isDemo && (
        <div className="bg-gradient-to-l from-[#1e3a5f] to-[#091426] rounded-2xl p-5 mb-5 text-right" dir="rtl">
          <p className="text-white font-bold mb-1">هذا مثال على تقرير ذكاء اصطناعي حقيقي</p>
          <p className="text-[#93c5fd] text-sm">في الحساب الفعلي، يُولَّد هذا التقرير تلقائياً بعد إدخال درجات بطاقة التقييم.</p>
        </div>
      )}

      <p className="text-center text-xs text-[#75777d] mt-6 print:block">
        تقرير صادر من منصة EduLens — إديو لينس © 2025
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
