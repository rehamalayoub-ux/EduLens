"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  unconfirmed: "البريد الإلكتروني غير مؤكد",
  ratelimit: "محاولات كثيرة — انتظر دقيقة",
  unknown: "حدث خطأ، حاول مجدداً",
};

const AVATAR_COLORS = ["#7c3aed","#0891b2","#be185d","#059669","#d97706","#2563eb","#0d9488"];
function pickColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const DEMO_TEACHERS = [
  { name: "أحمد محمد السالم",    subject: "الرياضيات",         grade: "الصف العاشر",      visits: 3, score: 92 },
  { name: "فاطمة علي الزهراني",  subject: "العلوم",             grade: "الصف الثامن",      visits: 1, score: null },
  { name: "خالد عبدالله العمري", subject: "اللغة العربية",      grade: "الصف الثاني عشر", visits: 2, score: 76 },
  { name: "نورة سعد القحطاني",   subject: "اللغة الإنجليزية",  grade: "الصف العاشر",      visits: 4, score: 95 },
  { name: "محمد إبراهيم الشمري", subject: "التاريخ",            grade: "الصف الحادي عشر", visits: 1, score: null },
  { name: "سلمى عمر البلوي",     subject: "التربية الإسلامية", grade: "الصف التاسع",      visits: 6, score: 90 },
];

function ScoreBar({ score }: { score: number | null }) {
  if (!score) return <span className="text-[#c5c6cd] text-xs font-bold">لم يُقيَّم بعد</span>;
  const color = score >= 90 ? "#00a64a" : score >= 75 ? "#f59e0b" : "#ba1a1a";
  const label = score >= 90 ? "ممتاز" : score >= 75 ? "جيد" : "يحتاج تطوير";
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{score}%</span>
      </div>
      <div className="h-1.5 bg-[#f2f4f6] rounded-full overflow-hidden">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function TeacherPreviewCard({ t }: { t: typeof DEMO_TEACHERS[0] }) {
  const initials = t.name.split(" ").slice(0, 2).map(w => w[0]).join("");
  const color = pickColor(t.name);
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shadow-lg shrink-0"
          style={{ background: color }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="text-white text-sm font-bold leading-tight truncate">{t.name}</p>
          <p className="text-[#93c5fd] text-[11px] mt-0.5">{t.subject}</p>
          <p className="text-[#64748b] text-[10px]">{t.grade}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-white/10 rounded-xl p-2 text-center">
          <p className="text-white text-sm font-bold">{t.visits}</p>
          <p className="text-[#93c5fd] text-[9px]">زيارات</p>
        </div>
        <div className="flex-1 bg-white/10 rounded-xl p-2 text-center">
          {t.score
            ? <><p className="text-sm font-bold" style={{ color: t.score >= 90 ? "#4ade80" : t.score >= 75 ? "#fbbf24" : "#f87171" }}>{t.score}%</p>
                <p className="text-[#93c5fd] text-[9px]">التقييم</p></>
            : <><p className="text-[#64748b] text-sm font-bold">—</p>
                <p className="text-[#93c5fd] text-[9px]">التقييم</p></>
          }
        </div>
      </div>
      <ScoreBar score={t.score} />
    </div>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMsg = errorCode ? ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.unknown : null;
  const registered = searchParams.get("registered") === "1";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-4 py-10" dir="rtl">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="bg-white rounded-2xl px-8 py-4 shadow-sm mb-3 border border-[#e0e3e5]">
          <Image src="/logo.svg" alt="EduLens" width={200} height={76} priority />
        </div>
        <p className="text-[#45474c] text-sm font-medium">تقييم المعلمين بذكاء ووضوح</p>
      </div>

      {/* Demo section — banner + teacher cards */}
      <div className="w-full max-w-2xl mb-6">
        <div className="bg-gradient-to-br from-[#0f2744] via-[#091426] to-[#0c1f3d] rounded-3xl shadow-xl overflow-hidden">

          {/* Top banner */}
          <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row items-center gap-4 border-b border-white/10">
            <div className="flex-1 text-right">
              <p className="text-white font-bold text-base mb-0.5">جرّب EduLens الآن — مجاناً وبدون حساب</p>
              <p className="text-[#93c5fd] text-xs">استعرض لوحات التقييم والمعلمين مباشرة — البيانات أدناه حقيقية من البيئة التجريبية</p>
            </div>
            <form method="POST" action="/api/demo-login" className="shrink-0">
              <button type="submit"
                className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#0c1a2e] font-bold px-6 py-2.5 rounded-xl text-sm transition whitespace-nowrap flex items-center gap-2 shadow-lg">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                دخول تجريبي فوري
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Login form */}
      <div className="w-full max-w-sm space-y-3">
        <div className="bg-white rounded-3xl shadow-sm border border-[#e0e3e5] px-6 py-7">
          <h2 className="text-base font-bold text-[#091426] text-right mb-5">تسجيل الدخول</h2>

          <form method="POST" action="/api/auth/login" className="space-y-4">
            <div>
              <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <input name="email" type="email" required dir="ltr" placeholder="example@school.edu"
                  className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#091426] transition text-sm pl-10"/>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Link href="/forgot-password" className="text-xs text-[#45474c] hover:text-[#091426]">نسيت كلمة المرور؟</Link>
                <label className="text-sm font-medium text-[#191c1e]">كلمة المرور</label>
              </div>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} required minLength={6} placeholder="••••••••"
                  className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#091426] transition text-sm pr-10 pl-10"/>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75777d]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#191c1e]">
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {registered && <p className="text-right text-sm text-[#166534] bg-[#f0fdf4] rounded-xl px-4 py-2 border border-[#bbf7d0]">تم إنشاء الحساب — سجّل الدخول الآن</p>}
            {errorMsg && <p className="text-right text-sm text-[#ba1a1a] bg-[#fff1f1] rounded-xl px-4 py-2">{errorMsg}</p>}

            <button type="submit"
              className="w-full bg-[#091426] hover:bg-[#1e293b] text-white font-semibold py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              تسجيل الدخول
            </button>
          </form>

          <div className="mt-5 border-t border-[#e0e3e5] pt-4 text-center">
            <p className="text-sm text-[#45474c] mb-3">ليس لديك حساب؟</p>
            <Link href="/register"
              className="w-full flex items-center justify-center gap-2 border border-[#c5c6cd] rounded-xl py-3 text-sm font-semibold text-[#191c1e] hover:bg-[#f2f4f6] transition">
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-[#75777d]">2025 EduLens. جميع الحقوق محفوظة.</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
