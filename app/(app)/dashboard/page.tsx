import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  const [{ data: teachers }, { data: allEvaluations }, { data: thisMonthEvals }] = await Promise.all([
    supabase.from("teachers").select("id, name, subject, grade_level").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("evaluations").select("id, teacher_id, status, date, average_score, lesson_topic").eq("user_id", user.id).order("date", { ascending: false }),
    supabase.from("evaluations").select("id").eq("user_id", user.id).gte("date", firstOfMonth),
  ]);

  const totalTeachers = teachers?.length ?? 0;
  const thisMonthCount = thisMonthEvals?.length ?? 0;
  const completed = allEvaluations?.filter((e) => e.status === "completed").length ?? 0;
  const drafts = allEvaluations?.filter((e) => e.status === "draft").length ?? 0;
  const remaining = Math.max(0, totalTeachers - thisMonthCount);

  // Build teacher cards with their last evaluation
  const teacherCards = (teachers ?? []).slice(0, 3).map((t) => {
    const evals = (allEvaluations ?? []).filter((e) => e.teacher_id === t.id);
    const lastEval = evals[0] ?? null;
    return { ...t, lastEval, visitCount: evals.length };
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <Link
          href="/evaluations/new"
          className="flex items-center gap-2 bg-[#00a64a] hover:bg-[#009040] text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm border-2 border-dashed border-[#4ade80]"
        >
          <PlusIcon />
          <span>تقييم جديد</span>
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[#091426]">لوحة القيادة</h1>
          <p className="text-sm text-[#45474c] mt-0.5">مرحباً بك، إليك نظرة عامة على أدائك هذا الشهر.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatCard value={remaining} label="الزيارات المتبقية" icon={<RemainingIcon />} iconBg="bg-[#fce8e8]" iconColor="text-[#ba1a1a]" />
        <StatCard value={drafts} label="التقييمات المسودة" icon={<DraftIcon />} iconBg="bg-[#f2f4f6]" iconColor="text-[#45474c]" />
        <StatCard value={completed} label="التقييمات المكتملة" icon={<CompletedIcon />} iconBg="bg-[#dcfce7]" iconColor="text-[#00a64a]" highlight />
        <StatCard value={thisMonthCount} label="زياراتي هذا الشهر" icon={<CalendarIcon />} iconBg="bg-[#e8f0fe]" iconColor="text-[#3b5bdb]" />
        <StatCard value={totalTeachers} label="معلميني" icon={<TeachersStatIcon />} iconBg="bg-[#ede9fe]" iconColor="text-[#7c3aed]" />
      </div>

      {/* Teachers section */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/teachers" className="text-sm text-[#45474c] hover:text-[#091426] transition flex items-center gap-1">
          <span>←</span>
          <span>عرض الكل</span>
        </Link>
        <h2 className="text-xl font-bold text-[#091426]">معلميني</h2>
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

      {/* Add teacher button bottom right */}
      <div className="fixed bottom-6 left-6">
        <Link
          href="/teachers/new"
          className="flex items-center gap-2 bg-[#00a64a] hover:bg-[#009040] text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition text-sm"
        >
          <PlusIcon />
          إضافة معلم جديد
        </Link>
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
        <div className="w-12 h-12 rounded-full bg-[#e0e3e5] flex items-center justify-center text-sm font-bold text-[#45474c]">
          {initials}
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
              ? new Date(lastEval.date).toLocaleDateString("ar-SA", { day: "2-digit", month: "long", year: "numeric" })
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
          href={`/teachers/${teacher.id}/edit`}
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
