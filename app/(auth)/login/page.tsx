"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <div className="bg-white rounded-2xl px-8 py-5 shadow-sm mb-3">
          <EduLensLogo />
        </div>
        <p className="text-[#45474c] text-base font-medium">تقييم المعلمين بذكاء ووضوح</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm px-6 py-8">
        <form onSubmit={handleLogin} noValidate>
          {/* Email */}
          <div className="mb-5">
            <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@school.edu"
                required
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-base pr-4 pl-10"
                dir="ltr"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d]">
                <MailIcon />
              </span>
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <Link
                href="/forgot-password"
                className="text-sm text-[#45474c] hover:text-[#091426] transition"
              >
                نسيت كلمة المرور؟
              </Link>
              <label className="text-sm font-medium text-[#191c1e]">
                كلمة المرور
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-base pr-10 pl-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75777d]">
                <LockIcon />
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#191c1e] transition"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-right text-sm text-[#ba1a1a] mt-3 mb-1">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full bg-[#091426] hover:bg-[#1e293b] text-white font-semibold text-base rounded-xl py-3.5 flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <LoginIcon />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-[#e0e3e5]" />

        {/* Sign up */}
        <p className="text-center text-[#45474c] text-sm mb-4">ليس لديك حساب؟</p>
        <Link
          href="/register"
          className="w-full flex items-center justify-center gap-2 border border-[#c5c6cd] rounded-xl py-3.5 text-[#191c1e] font-semibold text-base hover:bg-[#f2f4f6] transition"
        >
          <PersonAddIcon />
          <span>إنشاء حساب جديد</span>
        </Link>
      </div>

      {/* Pagination dots */}
      <div className="flex gap-2 mt-6">
        <span className="w-2 h-2 rounded-full bg-[#c5c6cd]" />
        <span className="w-2 h-2 rounded-full bg-[#091426]" />
        <span className="w-2 h-2 rounded-full bg-[#c5c6cd]" />
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-[#75777d] text-center">
        © 2024 إيدولينس التعليمية. جميع الحقوق محفوظة.
      </p>
    </div>
  );
}

function EduLensLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="10" width="36" height="44" rx="4" fill="#e8f0fe" stroke="#1e293b" strokeWidth="1.5"/>
          <line x1="12" y1="20" x2="36" y2="20" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="12" y1="26" x2="36" y2="26" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="12" y1="32" x2="28" y2="32" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="38" cy="38" r="12" fill="white" stroke="#1e293b" strokeWidth="1.5"/>
          <ellipse cx="38" cy="38" rx="6" ry="4" fill="#1e293b" opacity="0.15"/>
          <circle cx="38" cy="38" r="3" fill="#1e293b"/>
          <circle cx="39.5" cy="36.5" r="1" fill="white"/>
          <polyline points="6,14 2,8 10,10" fill="#00a64a" stroke="#00a64a" strokeWidth="1"/>
          <path d="M4 10 L7 6 L10 8" fill="#00a64a"/>
        </svg>
      </div>
      {/* Text */}
      <div className="text-right">
        <div className="text-2xl font-bold text-[#091426] leading-tight">
          Edu<span className="text-[#00a64a]">Lens</span>
        </div>
        <div className="text-sm font-bold text-[#091426] leading-tight">إديو لينس</div>
        <div className="text-[10px] text-[#45474c] tracking-wide">رؤية واضحة لتعليم أفضل</div>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  );
}

function PersonAddIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
