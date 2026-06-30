import Link from "next/link";
import PrintButton from "@/app/(app)/evaluations/[id]/PrintButton";

const DEMO = {
  name: "سارة أحمد القحطاني",
  stage: "المرحلة الابتدائية",
  department: "الروضة",
  month: "يونيو 2026",
  teacherCount: 5,
  totalVisits: 12,
  completedReports: 10,
  draftReports: 2,
  visitedTeachers: 4,
  unvisitedTeachers: 1,
  completionRate: 83,
  avgScore: 4.2,
  teachers: [
    { name: "منى سالم العتيبي",   visits: 3, lastVisit: "15 يونيو", avgScore: 4.6, status: "تم تقييمه" },
    { name: "هيا خالد الشمري",    visits: 2, lastVisit: "20 يونيو", avgScore: 3.8, status: "تم تقييمه" },
    { name: "ريم محمد الدوسري",   visits: 1, lastVisit: "22 يونيو", avgScore: null, status: "يحتاج متابعة" },
    { name: "نوف عبدالله الحربي", visits: 3, lastVisit: "10 يونيو", avgScore: 4.2, status: "تم تقييمه" },
    { name: "دلال فهد المطيري",   visits: 0, lastVisit: null,       avgScore: null, status: "لا توجد زيارات بعد" },
  ],
  aiSummary: {
    level: "مستوى الإنجاز جيد جداً — حققت المشرفة سارة نسبة إنجاز 83% خلال شهر يونيو.",
    needFollowup: ["ريم محمد الدوسري — تحتاج إلى زيارة متابعة لاستكمال التقرير", "دلال فهد المطيري — لم تُزَر بعد ويُنصح بجدولة زيارة خلال الأسبوع القادم"],
    weakAreas: ["التقويم أثناء الحصة", "إدارة وقت الحصة"],
    strongAreas: ["وضوح الشرح", "التخطيط للدرس"],
    recommendation: "يُنصح بإعطاء الأولوية لزيارة المعلمة دلال فهد قبل نهاية الشهر، ومتابعة استكمال تقرير ريم محمد لضمان اكتمال السجل الشهري.",
  },
};

export default function SupervisorReportPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <PrintButton />
          <Link href="/director"
            className="flex items-center gap-1.5 border border-[#c5c6cd] text-[#45474c] text-sm px-4 py-2 rounded-xl hover:bg-[#f2f4f6] transition">
            ← العودة للوحة التحكم
          </Link>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[#091426]">تقرير إنجاز المشرف</h1>
          <p className="text-sm text-[#45474c]">{DEMO.month}</p>
        </div>
      </div>

      {/* Supervisor info */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-[#00a64a] text-white text-xs font-semibold px-3 py-1 rounded-full">{DEMO.completionRate}% نسبة الإنجاز</div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-[#091426]">{DEMO.name}</h2>
            <p className="text-sm text-[#45474c]">{DEMO.stage} — {DEMO.department}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { n: DEMO.teacherCount,      label: "عدد المعلمين",         bg: "bg-[#e8f0fe]", clr: "text-[#3b5bdb]" },
            { n: DEMO.totalVisits,       label: "إجمالي الزيارات",      bg: "bg-[#dcfce7]", clr: "text-[#00a64a]" },
            { n: DEMO.completedReports,  label: "تقارير مكتملة",        bg: "bg-[#dcfce7]", clr: "text-[#00a64a]" },
            { n: DEMO.unvisitedTeachers, label: "معلمون لم يُزاروا",    bg: "bg-[#fce8e8]", clr: "text-[#ba1a1a]" },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${s.clr}`}>{s.n}</p>
              <p className="text-xs text-[#45474c] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Teachers table */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm mb-5 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f2f4f6] text-right">
          <h3 className="font-bold text-[#091426]">المعلمون تحت الإشراف</h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-[#f7f9fb] border-b border-[#e0e3e5]">
            <tr>
              {["الحالة", "متوسط التقييم", "آخر زيارة", "عدد الزيارات", "اسم المعلم"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-[#45474c]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2f4f6]">
            {DEMO.teachers.map((t, i) => (
              <tr key={i} className="hover:bg-[#f7f9fb] transition">
                <td className="px-5 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-5 py-3 text-sm font-bold" style={{ color: t.avgScore ? "#00a64a" : "#75777d" }}>
                  {t.avgScore ? `${(t.avgScore * 20).toFixed(0)}%` : "—"}
                </td>
                <td className="px-5 py-3 text-sm text-[#75777d]">{t.lastVisit ?? "—"}</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#091426]">{t.visits}</td>
                <td className="px-5 py-3 text-sm font-semibold text-[#091426]">{t.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Summary */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6">
        <div className="flex items-center justify-end gap-2 mb-5">
          <h3 className="text-lg font-bold text-[#091426]">ملخص الذكاء الاصطناعي</h3>
          <span className="text-xl">✨</span>
        </div>
        <div className="space-y-4">
          <AICard color="navy" title="مستوى الإنجاز" content={DEMO.aiSummary.level} />
          <AICard color="amber" title="المعلمون الذين يحتاجون متابعة"
            content={DEMO.aiSummary.needFollowup.map(s => `• ${s}`).join("\n")} />
          <div className="grid grid-cols-2 gap-4">
            <AICard color="red" title="محاور التقييم الأضعف"
              content={DEMO.aiSummary.weakAreas.map(s => `• ${s}`).join("\n")} />
            <AICard color="green" title="محاور التقييم الأقوى"
              content={DEMO.aiSummary.strongAreas.map(s => `• ${s}`).join("\n")} />
          </div>
          <AICard color="purple" title="التوصية الإدارية للشهر القادم" content={DEMO.aiSummary.recommendation} />
        </div>
      </div>
    </div>
  );
}

function AICard({ color, title, content }: { color: string; title: string; content: string }) {
  const borders: Record<string, string> = {
    navy: "border-r-[#091426]", green: "border-r-[#00a64a]",
    amber: "border-r-[#f59e0b]", red: "border-r-[#ba1a1a]", purple: "border-r-[#7c3aed]",
  };
  return (
    <div className={`bg-[#f7f9fb] rounded-xl p-4 border-r-4 ${borders[color] ?? "border-r-[#091426]"}`}>
      <p className="text-sm font-bold text-[#091426] text-right mb-2">{title}</p>
      <p className="text-sm text-[#45474c] text-right whitespace-pre-line leading-relaxed">{content}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "تم تقييمه":        "bg-[#dcfce7] text-[#00a64a]",
    "يحتاج متابعة":     "bg-[#fff3cd] text-[#92600a]",
    "لا توجد زيارات بعد": "bg-[#fce8e8] text-[#ba1a1a]",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${map[status] ?? "bg-[#f2f4f6] text-[#45474c]"}`}>
      {status}
    </span>
  );
}
