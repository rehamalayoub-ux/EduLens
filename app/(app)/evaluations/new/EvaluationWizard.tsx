"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RUBRIC_CATEGORIES } from "@/lib/rubric";
import type { RubricCategory } from "@/types/database";

interface Teacher { id: string; name: string; subject: string; grade_level: string; }

const STEPS = [
  { num: 1, label: "بيانات الحصة" },
  { num: 2, label: "بطاقة التقييم" },
  { num: 3, label: "الملاحظات" },
  { num: 4, label: "التغذية الراجعة" },
];

type Scores = Record<string, number | null>;
type Notes = Record<string, string>;

export default function EvaluationWizard({ teachers }: { teachers: Teacher[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 fields
  const [teacherId, setTeacherId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [lessonTopic, setLessonTopic] = useState("");

  // Step 2 fields
  const [scores, setScores] = useState<Scores>(() =>
    Object.fromEntries(RUBRIC_CATEGORIES.map((c) => [c.key, null]))
  );
  const [categoryNotes, setCategoryNotes] = useState<Notes>(() =>
    Object.fromEntries(RUBRIC_CATEGORIES.map((c) => [c.key, ""]))
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(RUBRIC_CATEGORIES[0].key);

  // Step 3 fields
  const [observationNotes, setObservationNotes] = useState("");

  // Step 4 AI output
  const [aiFeedback, setAiFeedback] = useState<{
    strengths: string; improvements: string; recommendations: string;
    developmentPlan: string; summary: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [finalComments, setFinalComments] = useState("");

  const selectedTeacher = teachers.find((t) => t.id === teacherId);
  const filledScores = Object.values(scores).filter((v) => v !== null).length;
  const totalScore = Object.values(scores).reduce<number>((acc, v) => acc + (v ?? 0), 0);
  const avgScore = filledScores > 0 ? totalScore / RUBRIC_CATEGORIES.length : 0;

  function setScore(key: string, val: number) {
    setScores((s) => ({ ...s, [key]: val }));
  }

  // Step 1 → 2
  function goStep2() {
    if (!teacherId || !date || !subject || !gradeLevel || !lessonTopic) {
      setError("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    setError(null);
    setStep(2);
  }

  // Step 2 → 3
  function goStep3() {
    const unfilled = RUBRIC_CATEGORIES.filter((c) => scores[c.key] === null);
    if (unfilled.length > 0) {
      setError(`يرجى تقييم جميع المحاور. المتبقي: ${unfilled.length}`);
      return;
    }
    setError(null);
    setStep(3);
  }

  // Step 3 → 4 (generate AI)
  async function goStep4() {
    setError(null);
    setAiLoading(true);
    setStep(4);

    try {
      const res = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherName: selectedTeacher?.name,
          subject, gradeLevel, lessonTopic,
          scores: Object.fromEntries(
            RUBRIC_CATEGORIES.map((c) => [c.title, scores[c.key]])
          ),
          observationNotes,
          categoryNotes,
        }),
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setAiFeedback(data);
    } catch {
      setError("تعذّر الاتصال بالذكاء الاصطناعي. يمكنك الحفظ يدوياً.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSave(status: "draft" | "completed") {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const payload = {
      user_id: user.id,
      teacher_id: teacherId,
      date, subject, grade_level: gradeLevel, lesson_topic: lessonTopic,
      observation_notes: observationNotes,
      lesson_planning_score: scores.lesson_planning_score,
      classroom_management_score: scores.classroom_management_score,
      student_engagement_score: scores.student_engagement_score,
      teaching_strategies_score: scores.teaching_strategies_score,
      clarity_score: scores.clarity_score,
      assessment_score: scores.assessment_score,
      resources_score: scores.resources_score,
      differentiation_score: scores.differentiation_score,
      time_management_score: scores.time_management_score,
      overall_effectiveness_score: scores.overall_effectiveness_score,
      average_score: parseFloat(avgScore.toFixed(2)),
      ai_strengths: aiFeedback?.strengths ?? null,
      ai_improvement_areas: aiFeedback?.improvements ?? null,
      ai_recommendations: aiFeedback?.recommendations ?? null,
      ai_professional_development_plan: aiFeedback?.developmentPlan ?? null,
      ai_summary: aiFeedback?.summary ?? null,
      final_comments: finalComments || null,
      status,
    };

    const { data, error } = await supabase.from("evaluations").insert(payload).select().single();
    if (error) { setError("حدث خطأ أثناء الحفظ"); setSaving(false); return; }
    router.push(`/evaluations/${data.id}`);
  }

  return (
    <div>
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-0 w-full max-w-2xl">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                  step === s.num
                    ? "bg-[#091426] border-[#091426] text-white"
                    : step > s.num
                    ? "bg-[#00a64a] border-[#00a64a] text-white"
                    : "bg-white border-[#c5c6cd] text-[#75777d]"
                }`}>{step > s.num ? "✓" : s.num}</div>
                <span className={`text-xs mt-1 font-medium ${step === s.num ? "text-[#091426]" : "text-[#75777d]"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > s.num ? "bg-[#00a64a]" : "bg-[#c5c6cd]"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] rounded-xl px-4 py-3 text-sm text-right">
          {error}
        </div>
      )}

      {/* Step 1: Lesson Data */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-8">
          <h2 className="text-lg font-semibold text-[#091426] text-right mb-6">بيانات الحصة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">المعلم *</label>
              <select
                value={teacherId}
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  const t = teachers.find((t) => t.id === e.target.value);
                  if (t) { setSubject(t.subject); setGradeLevel(t.grade_level); }
                }}
                required
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm"
              >
                <option value="">اختر المعلم</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">تاريخ الزيارة *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm" />
            </div>
            <div>
              <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">المادة *</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="الرياضيات" required
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm" />
            </div>
            <div>
              <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">الصف / الشعبة *</label>
              <input type="text" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder="الثامن (أ)" required
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">موضوع الدرس *</label>
              <input type="text" value={lessonTopic} onChange={(e) => setLessonTopic(e.target.value)} placeholder="مثال: حل المعادلات التربيعية" required
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm" />
            </div>
          </div>
          <div className="flex justify-start mt-8">
            <button onClick={goStep2} className="bg-[#091426] hover:bg-[#1e293b] text-white font-semibold px-6 py-3 rounded-xl transition text-sm">
              التالي: بطاقة التقييم ←
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Rubric */}
      {step === 2 && (
        <div>
          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-5 mb-5">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-right">
              <InfoCell label="اسم المعلم" value={selectedTeacher?.name ?? "-"} />
              <InfoCell label="المادة الصفية" value={subject} />
              <InfoCell label="الصف / الشعبة" value={gradeLevel} />
              <InfoCell label="تاريخ الزيارة" value={new Date(date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })} />
              <InfoCell label="النقاط" value={`${totalScore} / ٠`} />
              <InfoCell label="المحاور" value={`${filledScores} / ${RUBRIC_CATEGORIES.length}`} />
            </div>
          </div>

          {/* Rubric categories */}
          <div className="space-y-3 mb-6">
            {RUBRIC_CATEGORIES.map((cat) => (
              <RubricCard
                key={cat.key}
                category={cat}
                score={scores[cat.key]}
                note={categoryNotes[cat.key]}
                expanded={expandedCategory === cat.key}
                onToggle={() => setExpandedCategory(expandedCategory === cat.key ? null : cat.key)}
                onScore={(v) => setScore(cat.key, v)}
                onNote={(v) => setCategoryNotes((n) => ({ ...n, [cat.key]: v }))}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-start">
            <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-[#c5c6cd] text-[#45474c] text-sm font-medium hover:bg-[#f2f4f6] transition">
              → السابق
            </button>
            <button onClick={goStep3} className="bg-[#091426] hover:bg-[#1e293b] text-white font-semibold px-6 py-3 rounded-xl transition text-sm">
              التالي: الملاحظات ←
            </button>
            <button onClick={() => handleSave("draft")} disabled={saving} className="border border-[#c5c6cd] text-[#45474c] px-5 py-3 rounded-xl text-sm hover:bg-[#f2f4f6] transition disabled:opacity-50">
              {saving ? "..." : "حفظ كمسودة"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Notes */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-8">
          <h2 className="text-lg font-semibold text-[#091426] text-right mb-2">ملاحظات المشرف</h2>
          <p className="text-sm text-[#45474c] text-right mb-6">
            أضف ملاحظاتك العامة حول الحصة. ستُستخدم هذه الملاحظات مع الدرجات لتوليد تغذية راجعة دقيقة بالذكاء الاصطناعي.
          </p>
          <textarea
            value={observationNotes}
            onChange={(e) => setObservationNotes(e.target.value)}
            placeholder="أضف ملاحظاتك هنا... مثال: أظهر المعلم تمكناً جيداً من المادة، غير أن إدارة الوقت كانت تحتاج إلى تحسين في مرحلة التطبيق."
            rows={8}
            className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition resize-none text-sm"
          />
          <div className="flex gap-3 justify-start mt-6">
            <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-[#c5c6cd] text-[#45474c] text-sm font-medium hover:bg-[#f2f4f6] transition">
              → السابق
            </button>
            <button onClick={goStep4} className="bg-[#00a64a] hover:bg-[#009040] text-white font-semibold px-6 py-3 rounded-xl transition text-sm flex items-center gap-2">
              <span>✨</span>
              توليد التغذية الراجعة بالذكاء الاصطناعي
            </button>
            <button onClick={() => handleSave("draft")} disabled={saving} className="border border-[#c5c6cd] text-[#45474c] px-5 py-3 rounded-xl text-sm hover:bg-[#f2f4f6] transition disabled:opacity-50">
              حفظ كمسودة
            </button>
          </div>
        </div>
      )}

      {/* Step 4: AI Feedback */}
      {step === 4 && (
        <div className="space-y-5">
          {aiLoading ? (
            <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-16 text-center">
              <div className="text-4xl mb-4 animate-pulse">✨</div>
              <p className="text-[#091426] font-semibold text-lg">جارٍ توليد التغذية الراجعة...</p>
              <p className="text-sm text-[#45474c] mt-2">يعمل الذكاء الاصطناعي على تحليل نتائج التقييم</p>
            </div>
          ) : (
            <>
              {aiFeedback ? (
                <>
                  <FeedbackCard title="نقاط القوة" icon="💪" color="green" value={aiFeedback.strengths}
                    onChange={(v) => setAiFeedback((f) => f ? { ...f, strengths: v } : f)} />
                  <FeedbackCard title="مجالات التحسين" icon="📈" color="amber" value={aiFeedback.improvements}
                    onChange={(v) => setAiFeedback((f) => f ? { ...f, improvements: v } : f)} />
                  <FeedbackCard title="التوصيات العملية" icon="🎯" color="navy" value={aiFeedback.recommendations}
                    onChange={(v) => setAiFeedback((f) => f ? { ...f, recommendations: v } : f)} />
                  <FeedbackCard title="خطة التطوير المهني" icon="🗺️" color="purple" value={aiFeedback.developmentPlan}
                    onChange={(v) => setAiFeedback((f) => f ? { ...f, developmentPlan: v } : f)} />
                  <FeedbackCard title="ملخص الزيارة" icon="📋" color="gray" value={aiFeedback.summary}
                    onChange={(v) => setAiFeedback((f) => f ? { ...f, summary: v } : f)} />
                </>
              ) : (
                <div className="bg-[#ffdad6] border border-[#ba1a1a] rounded-2xl p-6 text-right">
                  <p className="text-[#93000a] font-medium mb-2">تعذّر توليد التغذية الراجعة</p>
                  <p className="text-sm text-[#45474c]">يمكنك الحفظ كمسودة والمحاولة لاحقاً.</p>
                </div>
              )}

              {/* Final comments */}
              <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6">
                <h3 className="text-base font-semibold text-[#091426] text-right mb-3">التعليقات الختامية للمشرف</h3>
                <textarea
                  value={finalComments}
                  onChange={(e) => setFinalComments(e.target.value)}
                  placeholder="أضف تعليقاتك الختامية..."
                  rows={4}
                  className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition resize-none text-sm"
                />
              </div>

              <div className="flex gap-3 justify-start">
                <button onClick={() => setStep(3)} className="px-5 py-3 rounded-xl border border-[#c5c6cd] text-[#45474c] text-sm font-medium hover:bg-[#f2f4f6] transition">
                  → السابق
                </button>
                <button onClick={() => goStep4()} className="border border-[#00a64a] text-[#00a64a] px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#dcfce7] transition flex items-center gap-2">
                  <span>🔄</span> إعادة التوليد
                </button>
                <button onClick={() => handleSave("completed")} disabled={saving} className="bg-[#091426] hover:bg-[#1e293b] text-white font-semibold px-6 py-3 rounded-xl transition text-sm disabled:opacity-60">
                  {saving ? "جارٍ الحفظ..." : "حفظ التقرير النهائي"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-xs text-[#75777d] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[#091426]">{value}</p>
    </div>
  );
}

function RubricCard({ category, score, note, expanded, onToggle, onScore, onNote }: {
  category: RubricCategory; score: number | null; note: string;
  expanded: boolean; onToggle: () => void;
  onScore: (v: number) => void; onNote: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm overflow-hidden">
      {/* Header */}
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-[#f7f9fb] transition">
        <div className="flex items-center gap-2">
          <ChevronIcon expanded={expanded} />
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            score !== null ? "bg-[#dcfce7] text-[#00a64a]" : "bg-[#f2f4f6] text-[#45474c]"
          }`}>
            {score !== null ? `${score} / 5` : "لم يكتمل"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-[#091426] text-sm">{category.title}</p>
            <p className="text-xs text-[#45474c]">{category.description}</p>
          </div>
          <span className="text-xl">{category.icon}</span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[#e0e3e5] px-5 py-5">
          <div className="flex flex-col md:flex-row-reverse gap-6">
            {/* Details (right in RTL) */}
            <div className="md:w-2/5">
              <p className="text-sm font-medium text-[#091426] text-right mb-3">نقاط التقييم التفصيلية:</p>
              <ul className="space-y-2">
                {category.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 justify-end text-right">
                    <span className="text-sm text-[#45474c]">{d}</span>
                    <span className="text-[#00a64a] mt-0.5 shrink-0">✔</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rating + notes (left) */}
            <div className="flex-1">
              <div className="text-right mb-3">
                <p className="text-sm font-medium text-[#091426]">التقييم (١ - ٥):</p>
              </div>
              <div className="flex gap-2 justify-end mb-4">
                {[5, 4, 3, 2, 1].map((v) => (
                  <button
                    key={v}
                    onClick={() => onScore(v)}
                    className={`w-11 h-11 rounded-xl border-2 font-bold text-sm transition ${
                      score === v
                        ? "bg-[#091426] border-[#091426] text-white"
                        : "border-[#c5c6cd] text-[#45474c] hover:border-[#091426] hover:text-[#091426]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <textarea
                value={note}
                onChange={(e) => onNote(e.target.value)}
                placeholder="أضف ملاحظاتك هنا..."
                rows={3}
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition resize-none text-sm"
              />

              <div className="mt-3 bg-[#f0fdf4] border border-[#dcfce7] rounded-xl px-4 py-3 text-right">
                <p className="text-xs text-[#00a64a] flex items-center justify-end gap-1">
                  <span>{category.aiHint}</span>
                  <span>:✨ تلميح AI</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ title, icon, color, value, onChange }: {
  title: string; icon: string; color: string; value: string; onChange: (v: string) => void;
}) {
  const borders: Record<string, string> = {
    green: "border-r-4 border-r-[#00a64a]",
    amber: "border-r-4 border-r-[#f59e0b]",
    navy: "border-r-4 border-r-[#091426]",
    purple: "border-r-4 border-r-[#7c3aed]",
    gray: "border-r-4 border-r-[#75777d]",
  };
  return (
    <div className={`bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6 ${borders[color]}`}>
      <h3 className="text-base font-semibold text-[#091426] text-right mb-3 flex items-center justify-end gap-2">
        <span>{title}</span>
        <span>{icon}</span>
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] outline-none focus:ring-2 focus:ring-[#1e293b] transition resize-none text-sm"
      />
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
