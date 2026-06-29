import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function EvaluationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("*, teacher:teachers(name, subject)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#091426]">سجل التقييمات</h1>
        <Link href="/evaluations/new" className="flex items-center gap-2 bg-[#00a64a] hover:bg-[#009040] text-white font-semibold px-5 py-3 rounded-xl transition text-sm">
          <PlusIcon />
          <span>تقييم جديد</span>
        </Link>
      </div>

      {!evaluations || evaluations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] py-20 text-center shadow-sm">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[#45474c] font-medium mb-1">لا توجد تقييمات بعد</p>
          <p className="text-sm text-[#75777d] mb-6">ابدأ بإنشاء أول تقييم</p>
          <Link href="/evaluations/new" className="inline-flex items-center gap-2 bg-[#091426] text-white px-5 py-3 rounded-xl text-sm font-semibold">
            تقييم جديد
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e0e3e5] overflow-hidden shadow-sm">
          <table className="w-full text-right">
            <thead className="bg-[#f7f9fb] border-b border-[#e0e3e5]">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c]">الإجراءات</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c]">الحالة</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c]">المعدل</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c]">المادة</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c]">التاريخ</th>
                <th className="px-5 py-3 text-xs font-semibold text-[#45474c]">المعلم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e5]">
              {(evaluations as any[]).map((ev) => (
                <tr key={ev.id} className="hover:bg-[#f7f9fb] transition">
                  <td className="px-5 py-4">
                    <Link href={`/evaluations/${ev.id}`} className="text-sm text-[#45474c] hover:text-[#091426] px-3 py-1.5 rounded-lg hover:bg-[#eceef0] transition">
                      عرض
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    {ev.status === "completed" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#dcfce7] text-[#00a64a]">مكتمل</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#f2f4f6] text-[#45474c]">مسودة</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#091426]">
                    {ev.average_score != null ? `${Number(ev.average_score).toFixed(1)} / 5` : "-"}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#45474c]">{ev.subject}</td>
                  <td className="px-5 py-4 text-sm text-[#75777d]">
                    {new Date(ev.date).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#091426] text-sm">{ev.teacher?.name}</p>
                    <p className="text-xs text-[#75777d]">{ev.teacher?.subject}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
