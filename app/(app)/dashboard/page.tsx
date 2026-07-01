import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDateAr } from "@/lib/formatDate";
import { cookies } from "next/headers";

const DEMO_TEACHERS = [
  { id: "d1", name: "أحمد محمد السالم",    subject: "الرياضيات",    grade_level: "الصف العاشر" },
  { id: "d2", name: "فاطمة علي الزهراني",  subject: "العلوم",        grade_level: "الصف الثامن" },
  { id: "d3", name: "خالد عبدالله العمري", subject: "اللغة العربية", grade_level: "الصف الثاني عشر" },
  { id: "d4", name: "نورة سعد القحطاني",   subject: "التربية الإسلامية", grade_level: "الصف السادس" },
];

const DEMO_EVALUATIONS = [
  { id: "e1", teacher_id: "d1", status: "completed", date: "2026-06-15", average_score: 4.6, lesson_topic: "المعادلات التربيعية" },
  { id: "e2", teacher_id: "d1", status: "completed", date: "2026-05-20", average_score: 4.3, lesson_topic: "الدوال والعلاقات" },
  { id: "e3", teacher_id: "d2", status: "draft",     date: "2026-06-22", average_score: null, lesson_topic: "الخلية وأجزاؤها" },
  { id: "e4", teacher_id: "d3", status: "completed", date: "2026-06-10", average_score: 3.8, lesson_topic: "أساليب النداء والاستفهام" },
  { id: "e5", teacher_id: "d4", status: "completed", date: "2026-06-18", average_score: 4.9, lesson_topic: "أركان الإسلام" },
  { id: "e6", teacher_id: "d4", status: "completed", date: "2026-05-10", average_score: 4.7, lesson_topic: "السيرة النبوية" },
];

export default async function DashboardPage() {
  let teachers: any[] = [];
  let allEvaluations: any[] = [];
  let thisMonthEvals: any[] = [];

  const cookieStore = await cookies();
  const isDemo = cookieStore.get("x-demo-session")?.value === "1";

  if (isDemo) {
    teachers = DEMO_TEACHERS;
    allEvaluations = DEMO_EVALUATIONS;
    thisMonthEvals = DEMO_EVALUATIONS.filter(e => e.date.startsWith("2026-06"));
  } else {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) redirect("/login");

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

      const [t, e, m] = await Promise.all([
        supabase.from("teachers").select("id, name, subject, grade_level").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("evaluations").select("id, teacher_id, status, date, average_score, lesson_topic").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("evaluations").select("id").eq("user_id", user.id).gte("date", firstOfMonth),
      ]);
      teachers = t.data ?? [];
      allEvaluations = e.data ?? [];
      thisMonthEvals = m.data ?? [];
    } catch {
      redirect("/login");
    }
  }

  const totalTeachers = teachers?.length ?? 0;
  const thisMonthCount = thisMonthEvals?.length ?? 0;
  const completed = allEvaluations?.filter((e) => e.status === "completed").length ?? 0;
  const drafts = allEvaluations?.filter((e) => e.status === "draft").length ?? 0;
  const remaining = Math.max(0, totalTeachers - thisMonthCount);

  // Overall level stats
  const completedEvals = allEvaluations?.filter((e) => e.status === "completed" && e.average_score != null) ?? [];
  const scores = completedEvals.map((e) => e.average_score as number);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const avgPct = Math.round(avgScore * 20);
  const excellentCount = scores.filter((s) => s * 20 >= 90).length;
  const goodCount = scores.filter((s) => s * 20 >= 75 && s * 20 < 90).length;
  const needsWorkCount = scores.filter((s) => s * 20 < 75).length;

  // Build teacher cards with their last evaluation
  const teacherCards = (teachers ?? []).slice(0, 3).map((t) => {
    const evals = (allEvaluations ?? []).filter((e) => e.teacher_id === t.id);
    const lastEval = evals[0] ?? null;
    return { ...t, lastEval, visitCount: evals.length };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#45474c]">مرحباً بك، إليك نظرة عامة على أدائك هذا الشهر.</p>
        <Link
          href="/teachers/new"
          className="flex items-center gap-2 bg-[#00a64a] hover:bg-[#009040] text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm"
        >
          <PlusIcon />
          <span>إضافة معلم</span>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard value={completed} label="التقييمات المكتملة" icon={<CompletedIcon />} iconBg="bg-[#dcfce7]" iconColor="text-[#00a64a]" highlight />
        <StatCard value={thisMonthCount} label="زياراتي هذا الشهر" icon={<CalendarIcon />} iconBg="bg-[#e8f0fe]" iconColor="text-[#3b5bdb]" />
        <StatCard value={totalTeachers} label="معلميني" icon={<TeachersStatIcon />} iconBg="bg-[#ede9fe]" iconColor="text-[#7c3aed]" />
      </div>

      {/* Teachers section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#091426]">معلميني</h2>
        <Link href="/teachers" className="text-sm text-[#45474c] hover:text-[#091426] transition flex items-center gap-1">
          عرض الكل
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </Link>
      </div>

      {teacherCards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] py-16 text-center shadow-sm">
          <div className="text-4xl mb-3">👨‍🏫</div>
          <p className="text-[#45474c] font-medium mb-4">لا يوجد معلمون بعد</p>
          <Link href="/teachers/new" className="inline-flex items-center gap-2 bg-[#091426] text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
            إضافة أول معلم
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {teacherCards.map((t) => (
            <TeacherCard key={t.id} teacher={t} />
          ))}
        </div>
      )}

      {/* ─── المستوى العام للمدرسين ─── */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#091426] mb-4 text-right">المستوى العام للمدرسين</h2>
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Average score */}
            <div className="text-center bg-[#f7f9fb] rounded-2xl p-5">
              <p className="text-4xl font-bold text-[#00a64a]">{avgPct > 0 ? `${avgPct}%` : "—"}</p>
              <p className="text-sm text-[#45474c] mt-1 font-medium">متوسط التقييم الكلي</p>
              <div className="mt-3 h-2 bg-[#e0e3e5] rounded-full overflow-hidden">
                <div className="h-2 rounded-full bg-[#00a64a] transition-all" style={{ width: `${avgPct}%` }} />
              </div>
            </div>
            {/* Distribution */}
            <div className="md:col-span-2 flex flex-col justify-center gap-3">
              <DistBar label="ممتاز (90%+)" count={excellentCount} total={scores.length} color="#00a64a" bg="#dcfce7" />
              <DistBar label="جيد (75–89%)" count={goodCount} total={scores.length} color="#f59e0b" bg="#fef3c7" />
              <DistBar label="يحتاج تطوير (أقل من 75%)" count={needsWorkCount} total={scores.length} color="#ba1a1a" bg="#fee2e2" />
            </div>
          </div>

          {/* Per-teacher mini row */}
          {teacherCards.length > 0 && (
            <div className="border-t border-[#f2f4f6] pt-4">
              <p className="text-xs font-semibold text-[#75777d] mb-3 text-right">مستوى كل معلم</p>
              <div className="flex flex-col gap-2">
                {teacherCards.map((t) => {
                  const pct = t.lastEval?.average_score ? Math.round(t.lastEval.average_score * 20) : null;
                  const color = pct == null ? "#c5c6cd" : pct >= 90 ? "#00a64a" : pct >= 75 ? "#f59e0b" : "#ba1a1a";
                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold min-w-[40px] text-left" style={{ color }}>{pct != null ? `${pct}%` : "—"}</span>
                      <div className="flex-1 h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: pct ? `${pct}%` : "0%", backgroundColor: color }} />
                      </div>
                      <span className="text-xs text-[#45474c] min-w-[140px] text-right">{t.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── توصيات للمشرف ─── */}
      <div className="mt-8 mb-4">
        <h2 className="text-xl font-bold text-[#091426] mb-4 text-right">توصيات للمشرف</h2>
        <SupervisorRecommendations
          totalTeachers={totalTeachers}
          thisMonthCount={thisMonthCount}
          needsWorkCount={needsWorkCount}
          excellentCount={excellentCount}
          avgPct={avgPct}
        />
      </div>

    </div>
  );
}

function DistBar({ label, count, total, color, bg }: { label: string; count: number; total: number; color: string; bg: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <span className="text-xs text-[#45474c] min-w-[160px] text-right">{label}</span>
      <div className="flex-1 h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold min-w-[28px]" style={{ color }}>
        {count}
      </span>
    </div>
  );
}

function SupervisorRecommendations({ totalTeachers, thisMonthCount, needsWorkCount, excellentCount, avgPct }: {
  totalTeachers: number; thisMonthCount: number; needsWorkCount: number; excellentCount: number; avgPct: number;
}) {
  const notVisited = totalTeachers - thisMonthCount;
  const tips: { icon: string; color: string; bg: string; text: string }[] = [];

  if (notVisited > 0)
    tips.push({ icon: "📅", color: "#ba1a1a", bg: "#fee2e2", text: `${notVisited} ${notVisited === 1 ? "معلم لم يتم زيارته" : "معلمين لم يتم زيارتهم"} هذا الشهر — يُنصح بجدولة الزيارات المتبقية` });

  if (needsWorkCount > 0)
    tips.push({ icon: "📋", color: "#92600a", bg: "#fef3c7", text: `${needsWorkCount} ${needsWorkCount === 1 ? "معلم يحتاج" : "معلمين يحتاجون"} إلى دعم — يُرجى متابعة خطة التطوير معهم` });

  if (excellentCount > 0)
    tips.push({ icon: "🏅", color: "#00a64a", bg: "#dcfce7", text: `${excellentCount} ${excellentCount === 1 ? "معلم حقق" : "معلمين حققوا"} مستوى ممتازاً — فرصة لتكريمهم ومشاركة تجاربهم الناجحة` });

  if (avgPct > 0 && avgPct < 75)
    tips.push({ icon: "⚠️", color: "#ba1a1a", bg: "#fee2e2", text: "المتوسط العام أقل من 75% — يُنصح بعقد اجتماع دعم تربوي شامل للمجموعة" });

  if (avgPct >= 85)
    tips.push({ icon: "✨", color: "#3b5bdb", bg: "#e8f0fe", text: "مستوى عام مرتفع — يمكن توثيق الممارسات الناجحة ومشاركتها مع باقي المشرفين" });

  if (tips.length === 0)
    tips.push({ icon: "✅", color: "#00a64a", bg: "#dcfce7", text: "لا توجد توصيات عاجلة حالياً — استمر في متابعة الزيارات الدورية" });

  return (
    <div className="bg-[#091426] rounded-2xl p-6" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#00a64a] text-lg">🤖</span>
        <span className="text-white font-bold text-sm">توصيات مولّدة بالذكاء الاصطناعي</span>
        <span className="mr-auto text-[10px] bg-[#00a64a]/20 text-[#00a64a] font-semibold px-2.5 py-1 rounded-full">بناءً على بيانات هذا الشهر</span>
      </div>
      <div className="flex flex-col gap-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3.5">
            <span className="text-xl mt-0.5 shrink-0">{tip.icon}</span>
            <p className="text-sm text-[#e0e3e5] leading-relaxed text-right flex-1">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, iconBg, iconColor, highlight }: {
  value: number; label: string; icon: React.ReactNode;
  iconBg: string; iconColor: string; highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm text-right ${highlight ? "border-[#00a64a]/30" : "border-[#e0e3e5]"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 mr-auto ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#091426]">{value}</p>
      <p className="text-xs text-[#45474c] mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function TeacherCard({ teacher }: { teacher: any }) {
  const { lastEval, visitCount } = teacher;

  const initials = teacher.name.split(" ").slice(0, 2).map((w: string) => w[0]).join(".");
  const hasVisit = visitCount > 0;
  const status = lastEval?.status;

  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#091426] flex items-center justify-center text-sm font-bold text-white shrink-0 shadow">
          {teacher.photo
            ? <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
            : <span>{initials}</span>
          }
        </div>
        <div className="text-right flex-1 mr-3">
          <h3 className="font-bold text-[#091426] text-base">{teacher.name}</h3>
          <div className="flex gap-2 justify-end mt-1">
            <span className="px-2 py-0.5 bg-[#f2f4f6] rounded-lg text-xs text-[#45474c]">{teacher.grade_level}</span>
            <span className="px-2 py-0.5 bg-[#f2f4f6] rounded-lg text-xs text-[#45474c]">{teacher.subject}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-right">
        <div>
          <p className="text-xs text-[#75777d]">عدد الزيارات</p>
          <p className="text-sm font-semibold text-[#091426]">{visitCount} {visitCount === 1 ? "زيارة" : "زيارات"}</p>
        </div>
        <div>
          <p className="text-xs text-[#75777d]">آخر تقييم</p>
          <p className={`text-sm font-semibold ${lastEval?.average_score ? "text-[#00a64a]" : "text-[#75777d]"}`}>
            {lastEval?.average_score ? `${Math.round(lastEval.average_score * 20)}%` : "--"}
          </p>
        </div>
      </div>

      {/* Last visit + status */}
      <div className="flex items-center justify-between">
        <StatusBadge status={status} hasVisit={hasVisit} />
        <div className="text-right">
          <p className="text-xs text-[#75777d]">تاريخ آخر زيارة</p>
          <p className="text-xs font-medium text-[#191c1e]">
            {lastEval?.date
              ? formatDateAr(lastEval.date)
              : "لم تتم الزيارة بعد"}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        {status === "draft" ? (
          <Link
            href={`/evaluations/${lastEval?.id}`}
            className="flex-1 bg-[#091426] hover:bg-[#1e293b] text-white font-semibold py-2.5 rounded-xl text-xs text-center transition"
          >
            استكمال التقييم
          </Link>
        ) : (
          <Link
            href={`/evaluations/new?teacher=${teacher.id}`}
            className="flex-1 bg-[#091426] hover:bg-[#1e293b] text-white font-semibold py-2.5 rounded-xl text-xs text-center transition"
          >
            تقييم جديد
          </Link>
        )}
        <Link
          href={`/teachers/${teacher.id}`}
          className="flex-1 border border-dashed border-[#c5c6cd] text-[#45474c] font-medium py-2.5 rounded-xl text-xs text-center hover:bg-[#f7f9fb] transition"
        >
          عرض ملف المعلم
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status, hasVisit }: { status: string | undefined; hasVisit: boolean }) {
  if (!hasVisit) {
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#fce8e8] text-[#ba1a1a]">مطلوب زيارة</span>;
  }
  if (status === "completed") {
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#dcfce7] text-[#00a64a]">مكتمل</span>;
  }
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f2f4f6] text-[#45474c]">مسودة</span>;
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function RemainingIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>;
}
function DraftIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function CompletedIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function CalendarIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function TeachersStatIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
