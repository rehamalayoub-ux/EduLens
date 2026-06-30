import Link from "next/link";

const DEMO_SUPERVISORS = [
  {
    id: "s1", name: "سارة أحمد القحطاني", stage: "المرحلة الابتدائية", department: "الروضة",
    teacherCount: 5, monthVisits: 12, completedReports: 10, completionRate: 83,
    lastActivity: "اليوم، 9:30 ص",
    teachers: [
      { id: "t1", name: "منى سالم العتيبي",    subject: "الرياضيات", grade: "الأول الابتدائي", visits: 3, lastVisit: "15 يونيو", lastScore: 4.6, status: "completed" },
      { id: "t2", name: "هيا خالد الشمري",     subject: "اللغة العربية", grade: "الثاني الابتدائي", visits: 2, lastVisit: "20 يونيو", lastScore: 3.8, status: "completed" },
      { id: "t3", name: "ريم محمد الدوسري",    subject: "التربية الإسلامية", grade: "الثالث الابتدائي", visits: 1, lastVisit: "22 يونيو", lastScore: null, status: "draft" },
      { id: "t4", name: "نوف عبدالله الحربي",  subject: "العلوم", grade: "الرابع الابتدائي", visits: 3, lastVisit: "10 يونيو", lastScore: 4.2, status: "completed" },
      { id: "t5", name: "دلال فهد المطيري",    subject: "التربية الفنية", grade: "الخامس الابتدائي", visits: 0, lastVisit: null, lastScore: null, status: "none" },
    ],
  },
  {
    id: "s2", name: "عبدالرحمن محمد الغامدي", stage: "المرحلة المتوسطة", department: "العلوم الطبيعية",
    teacherCount: 6, monthVisits: 9, completedReports: 7, completionRate: 70,
    lastActivity: "أمس، 2:15 م",
    teachers: [
      { id: "t6", name: "أحمد محمد السالم",    subject: "الرياضيات",    grade: "الصف السابع",  visits: 2, lastVisit: "18 يونيو", lastScore: 4.3, status: "completed" },
      { id: "t7", name: "خالد عبدالله العمري", subject: "الفيزياء",     grade: "الصف الثامن", visits: 2, lastVisit: "21 يونيو", lastScore: 3.5, status: "completed" },
      { id: "t8", name: "عمر سعد الزهراني",   subject: "الكيمياء",     grade: "الصف التاسع", visits: 1, lastVisit: "25 يونيو", lastScore: null, status: "draft" },
      { id: "t9", name: "فيصل ناصر العنزي",   subject: "الأحياء",      grade: "الصف السابع",  visits: 2, lastVisit: "12 يونيو", lastScore: 4.0, status: "completed" },
      { id: "t10", name: "بندر علي الرشيدي",  subject: "الرياضيات",    grade: "الصف الثامن", visits: 1, lastVisit: "28 يونيو", lastScore: null, status: "none" },
      { id: "t11", name: "طارق حسن الحميدي",  subject: "الفيزياء",     grade: "الصف التاسع", visits: 1, lastVisit: "5 يونيو",  lastScore: 3.9, status: "completed" },
    ],
  },
  {
    id: "s3", name: "فاطمة علي الزهراني", stage: "المرحلة الثانوية", department: "اللغات",
    teacherCount: 4, monthVisits: 7, completedReports: 6, completionRate: 75,
    lastActivity: "منذ يومين",
    teachers: [
      { id: "t12", name: "نورة سعد القحطاني",   subject: "اللغة الإنجليزية", grade: "الصف العاشر",     visits: 2, lastVisit: "17 يونيو", lastScore: 4.5, status: "completed" },
      { id: "t13", name: "محمد إبراهيم الشمري", subject: "اللغة العربية",   grade: "الصف الحادي عشر", visits: 2, lastVisit: "23 يونيو", lastScore: 4.1, status: "completed" },
      { id: "t14", name: "سلمى عمر البلوي",     subject: "اللغة الفرنسية",  grade: "الصف الثاني عشر", visits: 2, lastVisit: "19 يونيو", lastScore: 3.7, status: "completed" },
      { id: "t15", name: "أسماء يوسف الحربي",   subject: "اللغة الإنجليزية", grade: "الصف العاشر",     visits: 0, lastVisit: null, lastScore: null, status: "none" },
    ],
  },
];

const totalTeachers = DEMO_SUPERVISORS.reduce((a, s) => a + s.teacherCount, 0);
const totalVisits   = DEMO_SUPERVISORS.reduce((a, s) => a + s.monthVisits, 0);
const totalReports  = DEMO_SUPERVISORS.reduce((a, s) => a + s.completedReports, 0);
const avgCompletion = Math.round(DEMO_SUPERVISORS.reduce((a, s) => a + s.completionRate, 0) / DEMO_SUPERVISORS.length);

export default function DirectorPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="bg-[#091426] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          رئيس القسم
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[#091426]">لوحة تحكم المدير</h1>
          <p className="text-sm text-[#45474c] mt-0.5">تابع إنجاز المشرفين، زياراتهم الصفية، وتقييمات المعلمين من مكان واحد.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        {[
          { n: DEMO_SUPERVISORS.length, label: "المشرفون", icon: "👤", bg: "bg-[#e8f0fe]", clr: "text-[#3b5bdb]" },
          { n: totalTeachers, label: "إجمالي المعلمين", icon: "👨‍🏫", bg: "bg-[#ede9fe]", clr: "text-[#7c3aed]" },
          { n: totalVisits,   label: "زيارات هذا الشهر", icon: "📅", bg: "bg-[#dcfce7]", clr: "text-[#00a64a]" },
          { n: totalReports,  label: "التقارير المكتملة", icon: "✅", bg: "bg-[#dcfce7]", clr: "text-[#00a64a]" },
          { n: totalVisits - totalReports, label: "الزيارات المتبقية", icon: "📋", bg: "bg-[#fce8e8]", clr: "text-[#ba1a1a]" },
          { n: `${avgCompletion}%`, label: "نسبة الإنجاز العامة", icon: "📊", bg: "bg-[#fff3cd]", clr: "text-[#92600a]" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#e0e3e5] p-4 text-right shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2 mr-auto text-lg`}>{s.icon}</div>
            <p className="text-xl font-bold text-[#091426]">{s.n}</p>
            <p className={`text-[10px] font-medium mt-0.5 leading-tight ${s.clr}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Supervisors */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[#45474c]">{DEMO_SUPERVISORS.length} مشرفين</span>
        <h2 className="text-xl font-bold text-[#091426]">المشرفون</h2>
      </div>

      <div className="space-y-5">
        {DEMO_SUPERVISORS.map((s) => (
          <SupervisorCard key={s.id} supervisor={s} />
        ))}
      </div>
    </div>
  );
}

function SupervisorCard({ supervisor: s }: { supervisor: typeof DEMO_SUPERVISORS[0] }) {
  const initials = s.name.split(" ").slice(0, 2).map(w => w[0]).join(".");
  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm overflow-hidden">
      {/* Supervisor header */}
      <div className="p-5 border-b border-[#f2f4f6]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Completion ring */}
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f2f4f6" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#00a64a" strokeWidth="3"
                  strokeDasharray={`${s.completionRate} ${100 - s.completionRate}`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#091426]">{s.completionRate}%</span>
              </div>
            </div>
            <div className="flex gap-3 text-center">
              {[
                { n: s.monthVisits, label: "زيارات الشهر" },
                { n: s.completedReports, label: "تقارير مكتملة" },
                { n: s.teacherCount - s.completedReports, label: "متبقية" },
              ].map((stat, i) => (
                <div key={i} className="bg-[#f7f9fb] rounded-xl px-3 py-2 min-w-[70px]">
                  <p className="text-base font-bold text-[#091426]">{stat.n}</p>
                  <p className="text-[9px] text-[#75777d]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <h3 className="font-bold text-[#091426] text-base">{s.name}</h3>
              <div className="flex gap-2 justify-end mt-1">
                <span className="text-[10px] bg-[#e8f0fe] text-[#3b5bdb] px-2 py-0.5 rounded-full font-medium">{s.stage}</span>
                <span className="text-[10px] bg-[#f2f4f6] text-[#45474c] px-2 py-0.5 rounded-full">{s.department}</span>
              </div>
              <p className="text-[10px] text-[#75777d] mt-1">آخر نشاط: {s.lastActivity}</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#091426] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 justify-start">
          <Link href={`/director/supervisors/${s.id}/report`}
            className="border border-[#c5c6cd] text-[#45474c] text-xs font-medium px-4 py-2 rounded-xl hover:bg-[#f2f4f6] transition flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            تقرير الإنجاز
          </Link>
        </div>
      </div>

      {/* Teachers under supervisor */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] text-[#75777d]">{s.teacherCount} معلمين</span>
          <p className="text-sm font-semibold text-[#091426]">المعلمون تحت الإشراف</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {s.teachers.map(t => (
            <div key={t.id} className="border border-[#e0e3e5] rounded-xl p-3 flex items-center justify-between hover:bg-[#f7f9fb] transition">
              <div className="flex items-center gap-2">
                <StatusDot status={t.status} />
                <div>
                  <p className="text-xs font-semibold text-[#091426]">{t.name}</p>
                  <p className="text-[10px] text-[#75777d]">{t.subject} — {t.grade}</p>
                </div>
              </div>
              <div className="text-left flex flex-col items-end gap-0.5">
                {t.lastScore ? (
                  <span className="text-xs font-bold text-[#00a64a]">{(t.lastScore * 20).toFixed(0)}%</span>
                ) : (
                  <span className="text-[10px] text-[#75777d]">—</span>
                )}
                <span className="text-[9px] text-[#75777d]">{t.visits} {t.visits === 1 ? "زيارة" : "زيارات"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-[#00a64a]",
    draft:     "bg-[#f59e0b]",
    none:      "bg-[#c5c6cd]",
  };
  return <span className={`w-2 h-2 rounded-full shrink-0 ${map[status] ?? "bg-[#c5c6cd]"}`} />;
}
