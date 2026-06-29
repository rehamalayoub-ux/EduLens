import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Evaluation, Teacher } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: teachers }, { data: evaluations }] = await Promise.all([
    supabase.from("teachers").select("*").eq("user_id", user.id),
    supabase
      .from("evaluations")
      .select("*, teacher:teachers(name, subject)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalTeachers = teachers?.length ?? 0;
  const totalEvaluations = evaluations?.length ?? 0;
  const completed = evaluations?.filter((e) => e.status === "completed").length ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#091426]">لوحة التحكم</h1>
        <Link
          href="/evaluations/new"
          className="flex items-center gap-2 bg-[#00a64a] hover:bg-[#009040] text-white font-semibold px-5 py-3 rounded-xl transition text-sm"
        >
          <PlusIcon />
          <span>تقييم جديد</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard label="إجمالي المعلمين" value={totalTeachers} icon={<TeachersIcon />} color="blue" />
        <StatCard label="إجمالي التقييمات" value={totalEvaluations} icon={<EvalIcon />} color="navy" />
        <StatCard label="التقييمات المكتملة" value={completed} icon={<CheckIcon />} color="green" />
      </div>

      {/* Recent Evaluations */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e0e3e5] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e3e5]">
          <Link href="/evaluations" className="text-sm text-[#00a64a] hover:underline font-medium">
            عرض الكل
          </Link>
          <h2 className="text-base font-semibold text-[#091426]">التقييمات الأخيرة</h2>
        </div>

        {!evaluations || evaluations.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-[#45474c] font-medium mb-1">لا توجد تقييمات بعد</p>
            <p className="text-sm text-[#75777d]">ابدأ بإضافة تقييم جديد للمعلمين</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e0e3e5]">
            {(evaluations as (Evaluation & { teacher: { name: string; subject: string } })[]).map((ev) => (
              <Link
                key={ev.id}
                href={`/evaluations/${ev.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-[#f7f9fb] transition"
              >
                <StatusBadge status={ev.status} />
                <div className="flex items-center gap-8">
                  {ev.average_score != null && (
                    <span className="text-sm font-semibold text-[#091426]">
                      {ev.average_score.toFixed(1)} / 5
                    </span>
                  )}
                  <span className="text-sm text-[#45474c]">{ev.subject}</span>
                  <span className="text-sm text-[#75777d]">{formatDate(ev.date)}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#091426] text-sm">{ev.teacher?.name}</p>
                  <p className="text-xs text-[#75777d]">{ev.teacher?.subject}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-[#dce3ec] text-[#1e293b]",
    navy: "bg-[#1e293b] text-white",
    green: "bg-[#dcfce7] text-[#00a64a]",
  };
  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-right flex-1">
        <p className="text-2xl font-bold text-[#091426]">{value}</p>
        <p className="text-sm text-[#45474c]">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "completed" ? (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#dcfce7] text-[#00a64a]">مكتمل</span>
  ) : (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#f2f4f6] text-[#45474c]">مسودة</span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function TeachersIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function EvalIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}
function CheckIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
