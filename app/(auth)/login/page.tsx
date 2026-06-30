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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        setError("البريد الإلكتروني غير مؤكد — تحقق من بريدك أو أنشئ حساباً جديداً");
      } else if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (msg.includes("too many requests")) {
        setError("محاولات كثيرة — انتظر دقيقة ثم حاول مجدداً");
      } else {
        setError("حدث خطأ أثناء تسجيل الدخول، حاول مجدداً");
      }
      setLoading(false);
      return;
    }
    router.refresh();
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-4">
      <div className="mb-6 flex flex-col items-center">
        <div className="bg-white rounded-2xl px-8 py-4 shadow-sm mb-3 border border-[#e0e3e5]">
          <Image src="/logo.svg" alt="EduLens" width={240} height={92} priority />
        </div>
        <p className="text-[#45474c] text-sm font-medium">تقييم المعلمين بذكاء ووضوح</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm px-6 py-8 border border-[#e0e3e5]">
        <form onSubmit={handleLogin} noValidate>
          <div className="mb-4">
            <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@school.edu" required dir="ltr"
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm pl-10" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <Link href="/forgot-password" className="text-xs text-[#45474c] hover:text-[#091426]">نسيت كلمة المرور؟</Link>
              <label className="text-sm font-medium text-[#191c1e]">كلمة المرور</label>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8}
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm pr-10 pl-10" />
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

          {error && <p className="text-right text-sm text-[#ba1a1a] mt-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="mt-5 w-full bg-[#091426] hover:bg-[#1e293b] text-white font-semibold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition disabled:opacity-60">
            {loading
              ? <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg><span>تسجيل الدخول</span></>
            }
          </button>
        </form>

        <div className="my-5 border-t border-[#e0e3e5]" />
        <p className="text-center text-[#45474c] text-sm mb-3">ليس لديك حساب؟</p>
        <Link href="/register"
          className="w-full flex items-center justify-center gap-2 border border-[#c5c6cd] rounded-xl py-3 text-[#191c1e] font-semibold text-sm hover:bg-[#f2f4f6] transition">
          إنشاء حساب جديد
        </Link>
      </div>

      <div className="flex gap-2 mt-6">
        <span className="w-2 h-2 rounded-full bg-[#c5c6cd]" />
        <span className="w-2 h-2 rounded-full bg-[#091426]" />
        <span className="w-2 h-2 rounded-full bg-[#c5c6cd]" />
      </div>
      <p className="mt-4 text-xs text-[#75777d]">© 2024 إيدولينس التعليمية. جميع الحقوق محفوظة.</p>
    </div>
  );
}
