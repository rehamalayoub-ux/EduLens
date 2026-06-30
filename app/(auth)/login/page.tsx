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

function LoginForm() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMsg = errorCode ? ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.unknown : null;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-7 flex flex-col items-center">
        <div className="bg-white rounded-2xl px-8 py-4 shadow-sm mb-3 border border-[#e0e3e5]">
          <Image src="/logo.svg" alt="EduLens" width={220} height={84} priority />
        </div>
        <p className="text-[#45474c] text-sm font-medium">تقييم المعلمين بذكاء ووضوح</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {/* Real login — native form POST, no JS fetch */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#e0e3e5] px-6 py-7">
          <h2 className="text-base font-bold text-[#091426] text-right mb-5">تسجيل الدخول</h2>

          <form method="POST" action="/api/auth/login" className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  name="email" type="email" required dir="ltr"
                  placeholder="example@school.edu"
                  className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#091426] transition text-sm pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Link href="/forgot-password" className="text-xs text-[#45474c] hover:text-[#091426]">نسيت كلمة المرور؟</Link>
                <label className="text-sm font-medium text-[#191c1e]">كلمة المرور</label>
              </div>
              <div className="relative">
                <input
                  name="password" type={showPassword ? "text" : "password"} required minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#091426] transition text-sm pr-10 pl-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75777d]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
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

            {errorMsg && (
              <p className="text-right text-sm text-[#ba1a1a] bg-[#fff1f1] rounded-xl px-4 py-2">{errorMsg}</p>
            )}

            <button type="submit"
              className="w-full bg-[#091426] hover:bg-[#1e293b] text-white font-semibold py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
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

        {/* Divider */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-px bg-[#e0e3e5]" />
          <span className="text-xs text-[#75777d]">أو</span>
          <div className="flex-1 h-px bg-[#e0e3e5]" />
        </div>

        {/* Demo login — native form POST, no JS fetch */}
        <form method="POST" action="/api/demo-login">
          <button type="submit"
            className="w-full bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] text-[#166534] font-semibold py-3.5 rounded-2xl transition text-sm flex items-center justify-center gap-2 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            دخول تجريبي فوري بدون حساب
          </button>
        </form>
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
