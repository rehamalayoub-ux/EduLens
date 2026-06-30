"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  exists:        "هذا البريد الإلكتروني مسجّل بالفعل — سجّل الدخول",
  weak_password: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
  unknown:       "حدث خطأ أثناء إنشاء الحساب، حاول مجدداً",
};

function RegisterForm() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMsg  = errorCode ? ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.unknown : null;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-4">
      <div className="mb-6 text-center">
        <p className="text-xl font-bold text-[#091426]">Edu<span className="text-[#00a64a]">Lens</span></p>
        <p className="text-sm text-[#45474c]">إنشاء حساب جديد</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm px-6 py-8 border border-[#e0e3e5]">
        {/* Native form POST — no JS fetch */}
        <form method="POST" action="/api/auth/register" className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">الاسم الكامل *</label>
            <input
              name="fullName" type="text" required
              placeholder="أ. محمد أحمد"
              className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#091426] transition text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">البريد الإلكتروني *</label>
            <input
              name="email" type="email" required dir="ltr"
              placeholder="example@school.edu"
              className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#091426] transition text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">كلمة المرور *</label>
            <div className="relative">
              <input
                name="password" type={showPassword ? "text" : "password"} required minLength={8}
                placeholder="••••••••"
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#091426] transition text-sm pl-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#191c1e]">
                {showPassword
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            <p className="text-xs text-[#75777d] text-right mt-1">8 أحرف على الأقل</p>
          </div>

          {errorMsg && (
            <p className="text-right text-sm text-[#ba1a1a] bg-[#fff1f1] rounded-xl px-4 py-2">{errorMsg}</p>
          )}

          <button type="submit"
            className="w-full bg-[#091426] hover:bg-[#1e293b] text-white font-semibold py-3.5 rounded-xl transition text-sm">
            إنشاء الحساب
          </button>
        </form>

        <div className="mt-6 border-t border-[#e0e3e5] pt-5 text-center">
          <p className="text-sm text-[#45474c] mb-3">لديك حساب بالفعل؟</p>
          <Link href="/login"
            className="w-full block border border-[#c5c6cd] rounded-xl py-3 text-sm font-semibold text-[#191c1e] hover:bg-[#f2f4f6] transition text-center">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
