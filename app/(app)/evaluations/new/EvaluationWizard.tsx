"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDateAr } from "@/lib/formatDate";
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

    // Build score columns from all rubric categories
    const scoreColumns = Object.fromEntries(
      RUBRIC_CATEGORIES.map((c) => [c.key, scores[c.key]])
    );

    const payload = {
      user_id: user.id,
      teacher_id: teacherId,
      date, subject, grade_level: gradeLevel, lesson_topic: lessonTopic,
      observation_notes: observationNotes,
      ...scoreColumns,
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
        <div className="flex gap-5 items-start" dir="rtl">
          {/* Main form */}
          <div className="flex-1 bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-8">
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
              {selectedTeacher && (
                <div className="bg-[#f7f9fb] rounded-xl border border-[#e0e3e5] px-4 py-3 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-[10px] text-[#75777d]">آخر زيارة</p>
                    <p className="text-sm font-semibold text-[#091426]">15 يونيو 2026</p>
                  </div>
                  <div className="w-px h-8 bg-[#e0e3e5]" />
                  <div className="text-right">
                    <p className="text-[10px] text-[#75777d]">إجمالي الزيارات</p>
                    <p className="text-2xl font-bold text-[#00a64a]">3</p>
                  </div>
                </div>
              )}
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
                <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">الصف *</label>
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
              <button onClick={goStep2} className="bg-[#091426] hover:bg-[#1e293b] text-white font-semibold px-6 py-3 rounded-xl transition text-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                التالي: بطاقة التقييم
              </button>
            </div>
          </div>

          {/* AI Assistant panel */}
          {selectedTeacher && (
            <div className="w-72 shrink-0 space-y-3">
              <div className="bg-[#091426] rounded-2xl p-5 text-right">
                <div className="flex items-center justify-end gap-2 mb-4">
                  <p className="text-white text-sm font-bold">مساعد EduLens الذكي</p>
                  <span className="bg-[#00a64a] rounded-full p-1.5 text-white text-xs">✨</span>
                </div>
                <p className="text-[#a8b0bc] text-[11px] font-semibold mb-2">نصيحة سريعة</p>
                <p className="text-white text-sm leading-relaxed">
                  {selectedTeacher.subject === "الرياضيات"
                    ? `بناءً على التقييم الأخير للمعلم ${selectedTeacher.name}، يُنصح بالتركيز على معيار "إدارة الوقت" وتعزيز مشاركة الطلاب في مرحلة التطبيق.`
                    : `بناءً على بيانات المعلم ${selectedTeacher.name}، ركّز على جودة الأسئلة الصفية وتنويع استراتيجيات التدريس لتحقيق أفضل النتائج.`
                  }
                </p>
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#00a64a] text-xs font-bold">
                      {selectedTeacher.subject === "الرياضيات" ? "85%" : "78%"}
                    </span>
                    <span className="text-[#a8b0bc] text-[11px]">التقدم السنوي للمعلم</span>
                  </div>
                  <div className="bg-[#1e293b] rounded-full h-2">
                    <div
                      className="bg-[#00a64a] h-2 rounded-full"
                      style={{ width: selectedTeacher.subject === "الرياضيات" ? "85%" : "78%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Previous evaluations hint */}
              <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-4 text-right">
                <div className="flex items-center justify-end gap-2 mb-3">
                  <p className="text-sm font-bold text-[#091426]">آخر التقييمات</p>
                  <span className="text-base">🕐</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "زيارة صفية", score: "4.6 / 5", date: "15 يونيو" },
                    { label: "متابعة دورية", score: "4.2 / 5", date: "28 مايو" },
                    { label: "زيارة مفاجئة", score: "4.5 / 5", date: "10 مايو" },
                  ].map((v, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[#00a64a] text-xs font-bold">{v.score}</span>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-[#091426]">{v.label}</p>
                        <p className="text-[10px] text-[#75777d]">{v.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
              <InfoCell label="الصف" value={gradeLevel} />
              <InfoCell label="تاريخ الزيارة" value={formatDateAr(date)} />
              <InfoCell label="النقاط" value={`${totalScore} / ${RUBRIC_CATEGORIES.length * 5}`} />
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
            <button onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-[#c5c6cd] text-[#45474c] text-sm font-medium hover:bg-[#f2f4f6] transition flex items-center gap-2">
              السابق
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button onClick={goStep3} className="bg-[#091426] hover:bg-[#1e293b] text-white font-semibold px-6 py-3 rounded-xl transition text-sm flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              التالي: الملاحظات
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
            <button onClick={() => setStep(2)} className="px-5 py-3 rounded-xl border border-[#c5c6cd] text-[#45474c] text-sm font-medium hover:bg-[#f2f4f6] transition flex items-center gap-2">
              السابق
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
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
        <div className="space-y-5" dir="rtl">

          {/* Page header */}
          <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#dcfce7] flex items-center justify-center text-lg">🧠</div>
              <div>
                <h2 className="text-base font-bold text-[#091426]">مساعد التغذية الراجعة الذكي</h2>
                <p className="text-xs text-[#45474c] mt-0.5">حوّل ملاحظاتك إلى تقارير مبنية باستخدام تقنيات EduLens المتقدمة</p>
              </div>
            </div>
            {/* Quick stats */}
            <div className="flex gap-3">
              <div className="bg-[#f7f9fb] rounded-xl px-4 py-2 text-center">
                <p className="text-lg font-bold text-[#00a64a]">{avgScore > 0 ? `${Math.round(avgScore * 20)}%` : "—"}</p>
                <p className="text-[10px] text-[#45474c]">المعدل الكلي</p>
              </div>
              <div className="bg-[#f7f9fb] rounded-xl px-4 py-2 text-center">
                <p className="text-lg font-bold text-[#091426]">{filledScores}/{RUBRIC_CATEGORIES.length}</p>
                <p className="text-[10px] text-[#45474c]">محاور مكتملة</p>
              </div>
            </div>
          </div>

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
                  {/* Top row: 3 cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FeedbackCard title="ملخص الحصة" icon="📋" color="gray" value={aiFeedback.summary}
                      onChange={(v) => setAiFeedback((f) => f ? { ...f, summary: v } : f)} />
                    <FeedbackCard title="نقاط القوة" icon="✅" color="green" value={aiFeedback.strengths}
                      onChange={(v) => setAiFeedback((f) => f ? { ...f, strengths: v } : f)} />
                    <FeedbackCard title="جوانب التحسين" icon="📈" color="amber" value={aiFeedback.improvements}
                      onChange={(v) => setAiFeedback((f) => f ? { ...f, improvements: v } : f)} />
                  </div>

                  {/* Bottom row: 2 cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FeedbackCard title="تغذية راجعة بناءة" icon="💬" color="navy" value={aiFeedback.recommendations}
                      onChange={(v) => setAiFeedback((f) => f ? { ...f, recommendations: v } : f)} />
                    <FeedbackCard title="توصيات عملية" icon="🎯" color="purple" value={aiFeedback.developmentPlan}
                      onChange={(v) => setAiFeedback((f) => f ? { ...f, developmentPlan: v } : f)} />
                  </div>
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
                  rows={3}
                  className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition resize-none text-sm"
                />
              </div>

              {/* Actions footer */}
              <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm px-6 py-4 flex items-center justify-between">
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="px-4 py-2.5 rounded-xl border border-[#c5c6cd] text-[#45474c] text-sm hover:bg-[#f2f4f6] transition flex items-center gap-2">
                    تجاهل وحذف
                  </button>
                  <button onClick={() => goStep4()} className="border border-[#00a64a] text-[#00a64a] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#dcfce7] transition flex items-center gap-2">
                    <span>🔄</span> إعادة التوليد
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-xs text-[#75777d]">تم التوليد بواسطة EduLens AI — مراجعة المشرف مطلوبة قبل الحفظ</p>
                  <button onClick={() => handleSave("completed")} disabled={saving}
                    className="bg-[#091426] hover:bg-[#1e293b] text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm disabled:opacity-60 flex items-center gap-2">
                    {saving ? "جارٍ الحفظ..." : "حفظ التقرير وإرساله"}
                  </button>
                </div>
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
      {/* Header: icon+title on RIGHT, badge+chevron on LEFT */}
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#f7f9fb] transition" dir="rtl">
        {/* Right: icon + title */}
        <div className="flex items-center gap-3">
          <span className="text-xl shrink-0">{category.icon}</span>
          <div className="text-right">
            <p className="font-semibold text-[#091426] text-sm">{category.title}</p>
            <p className="text-xs text-[#45474c]">{category.description}</p>
          </div>
        </div>
        {/* Left: score badge + chevron */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            score !== null ? "bg-[#dcfce7] text-[#00a64a]" : "bg-[#f2f4f6] text-[#45474c]"
          }`}>
            {score !== null ? `${score} / 5` : "لم يكتمل"}
          </span>
          <ChevronIcon expanded={expanded} />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[#e0e3e5] px-5 py-5" dir="rtl">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Right: details */}
            <div className="md:w-2/5 text-right">
              <p className="text-sm font-medium text-[#091426] mb-3">نقاط التقييم التفصيلية:</p>
              <ul className="space-y-2">
                {category.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#00a64a] mt-0.5 shrink-0">✔</span>
                    <span className="text-sm text-[#45474c] text-right">{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Left: Rating + notes */}
            <div className="flex-1 text-right">
              <p className="text-sm font-medium text-[#091426] mb-3">التقييم (١ - ٥):</p>
              <div className="flex gap-2 justify-start mb-4">
                {[1, 2, 3, 4, 5].map((v) => (
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

              <div className="mt-3 bg-[#f0fdf4] border border-[#dcfce7] rounded-xl px-4 py-3">
                <p className="text-xs text-[#00a64a] flex items-center gap-1.5">
                  <span className="font-semibold shrink-0">✨ تلميح AI:</span>
                  <span>{category.aiHint}</span>
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
  const styles: Record<string, { border: string; bg: string; text: string }> = {
    green:  { border: "border-[#00a64a]", bg: "bg-[#dcfce7]", text: "text-[#00a64a]" },
    amber:  { border: "border-[#f59e0b]", bg: "bg-[#fff3cd]", text: "text-[#92600a]" },
    navy:   { border: "border-[#091426]", bg: "bg-[#e8edf3]", text: "text-[#091426]" },
    purple: { border: "border-[#7c3aed]", bg: "bg-[#ede9fe]", text: "text-[#5b21b6]" },
    gray:   { border: "border-[#75777d]", bg: "bg-[#f2f4f6]", text: "text-[#45474c]" },
  };
  const s = styles[color] ?? styles.gray;
  return (
    <div className={`bg-white rounded-2xl border ${s.border} shadow-sm p-5`} dir="rtl">
      <h3 className="text-sm font-bold text-[#091426] text-right mb-3 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full bg-[#f7f9fb] rounded-xl px-3 py-2.5 text-right text-[#191c1e] outline-none focus:ring-2 focus:ring-[#1e293b] transition resize-none text-sm"
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
