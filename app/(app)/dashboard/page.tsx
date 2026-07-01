import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DEMO_TEACHERS, DEMO_EVALUATIONS } from "@/lib/demo-data";
import TeachersList from "../teachers/TeachersList";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("x-demo-session")?.value === "1";

  let teachers: typeof DEMO_TEACHERS = [];
  let allEvaluations: typeof DEMO_EVALUATIONS = [];
  let thisMonthEvals: typeof DEMO_EVALUATIONS = [];

  let firstName = "المشرف";

  if (isDemo) {
    teachers = DEMO_TEACHERS;
    allEvaluations = DEMO_EVALUATIONS;
    thisMonthEvals = DEMO_EVALUATIONS.filter(e => e.date.startsWith("2026-06"));
  } else {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) redirect("/login");

      const fullName: string = user.user_metadata?.full_name ?? "";
      firstName = fullName.split(" ")[0] || "المشرف";

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

      const [t, e, m] = await Promise.all([
        supabase.from("teachers").select("id, name, subject, grade_level").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("evaluations").select("id, teacher_id, status, date, average_score").eq("user_id", user.id).order("date", { ascending: false }),
        supabase.from("evaluations").select("id, teacher_id").eq("user_id", user.id).gte("date", firstOfMonth),
      ]);

      const rawTeachers = t.data ?? [];
      const rawEvals = e.data ?? [];
      thisMonthEvals = (m.data ?? []) as any;

      // Enrich teachers with visits + avg_score
      teachers = rawTeachers.map((t: any) => {
        const evals = rawEvals.filter((e: any) => e.teacher_id === t.id);
        const lastCompleted = evals.find((e: any) => e.status === "completed" && e.average_score != null);
        const lastEval = evals[0];
        return {
          ...t,
          visits: evals.length,
          avg_score: lastCompleted ? Math.round(lastCompleted.average_score * 20) : null,
          status: lastEval?.status ?? "none",
        };
      });
      allEvaluations = rawEvals as any;
    } catch {
      redirect("/login");
    }
  }

  const totalTeachers = teachers.length;
  const thisMonthCount = thisMonthEvals.length;
  const completed = allEvaluations.filter(e => e.status === "completed").length;

  const scores = teachers.map(t => t.avg_score).filter((s): s is number => s != null);
  const avgPct = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const excellentCount = scores.filter(s => s >= 90).length;
  const goodCount = scores.filter(s => s >= 75 && s < 90).length;
  const needsWorkCount = scores.filter(s => s < 75).length;

  const dashboardTeachers = teachers.slice(0, 3);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xl font-bold text-[#091426]">
          مرحباً {firstName}، إليك نظرة عامة على أدائك هذا الشهر
        </p>
        <Link href="/teachers/new"
          className="flex items-center gap-2 bg-[#00a64a] hover:bg-[#009040] text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm">
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

      {/* Teachers section — same cards as teachers page */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/teachers" className="text-sm text-[#45474c] hover:text-[#091426] transition flex items-center gap-1">
          عرض الكل
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </Link>
        <h2 className="text-xl font-bold text-[#091426]">معلميني</h2>
      </div>

      <TeachersList teachers={dashboardTeachers} isDemo={isDemo} />

      {/* المستوى العام */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#091426] mb-4 text-right">المستوى العام للمدرسين</h2>
        <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center bg-[#f7f9fb] rounded-2xl p-5">
              <p className="text-4xl font-bold text-[#00a64a]">{avgPct > 0 ? `${avgPct}%` : "—"}</p>
              <p className="text-sm text-[#45474c] mt-1 font-medium">متوسط التقييم الكلي</p>
              <div className="mt-3 h-2 bg-[#e0e3e5] rounded-full overflow-hidden">
                <div className="h-2 rounded-full bg-[#00a64a]" style={{ width: `${avgPct}%` }} />
              </div>
            </div>
            <div className="md:col-span-2 flex flex-col justify-center gap-3">
              <DistBar label="ممتاز (90%+)" count={excellentCount} total={scores.length} color="#00a64a" />
              <DistBar label="جيد (75–89%)" count={goodCount} total={scores.length} color="#f59e0b" />
              <DistBar label="يحتاج تطوير (أقل من 75%)" count={needsWorkCount} total={scores.length} color="#ba1a1a" />
            </div>
          </div>
          {teachers.length > 0 && (
            <div className="border-t border-[#f2f4f6] pt-4">
              <p className="text-xs font-semibold text-[#75777d] mb-3 text-right">مستوى كل معلم</p>
              <div className="flex flex-col gap-2">
                {teachers.map((t) => {
                  const pct = t.avg_score;
                  const color = pct == null ? "#c5c6cd" : pct >= 90 ? "#00a64a" : pct >= 75 ? "#f59e0b" : "#ba1a1a";
                  return (
                    <div key={t.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold min-w-[40px] text-left" style={{ color }}>{pct != null ? `${pct}%` : "—"}</span>
                      <div className="flex-1 h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
                        <div className="h-1.5 rounded-full" style={{ width: pct ? `${pct}%` : "0%", backgroundColor: color }} />
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

      {/* توصيات للمشرف */}
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

function DistBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <span className="text-xs text-[#45474c] min-w-[160px] text-right">{label}</span>
      <div className="flex-1 h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold min-w-[28px]" style={{ color }}>{count}</span>
    </div>
  );
}

function SupervisorRecommendations({ totalTeachers, thisMonthCount, needsWorkCount, excellentCount, avgPct }: {
  totalTeachers: number; thisMonthCount: number; needsWorkCount: number; excellentCount: number; avgPct: number;
}) {
  const notVisited = totalTeachers - thisMonthCount;
  const tips: { icon: string; text: string }[] = [];
  if (notVisited > 0) tips.push({ icon: "📅", text: `${notVisited} ${notVisited === 1 ? "معلم لم يتم زيارته" : "معلمين لم يتم زيارتهم"} هذا الشهر — يُنصح بجدولة الزيارات المتبقية` });
  if (needsWorkCount > 0) tips.push({ icon: "📋", text: `${needsWorkCount} ${needsWorkCount === 1 ? "معلم يحتاج" : "معلمين يحتاجون"} إلى دعم — يُرجى متابعة خطة التطوير معهم` });
  if (excellentCount > 0) tips.push({ icon: "🏅", text: `${excellentCount} ${excellentCount === 1 ? "معلم حقق" : "معلمين حققوا"} مستوى ممتازاً — فرصة لتكريمهم ومشاركة تجاربهم الناجحة` });
  if (avgPct >= 85) tips.push({ icon: "✨", text: "مستوى عام مرتفع — يمكن توثيق الممارسات الناجحة ومشاركتها مع باقي المشرفين" });
  if (tips.length === 0) tips.push({ icon: "✅", text: "لا توجد توصيات عاجلة حالياً — استمر في متابعة الزيارات الدورية" });
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
  value: number; label: string; icon: React.ReactNode; iconBg: string; iconColor: string; highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm text-right ${highlight ? "border-[#00a64a]/30" : "border-[#e0e3e5]"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 mr-auto ${iconBg} ${iconColor}`}>{icon}</div>
      <p className="text-2xl font-bold text-[#091426]">{value}</p>
      <p className="text-xs text-[#45474c] mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function PlusIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CompletedIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function CalendarIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function TeachersStatIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
