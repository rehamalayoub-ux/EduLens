"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { setError("حدث خطأ. تحقق من البريد الإلكتروني."); return; }
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-4">
      <div className="mb-6 text-center">
        <p className="text-xl font-bold text-[#091426]">Edu<span className="text-[#00a64a]">Lens</span></p>
        <p className="text-sm text-[#45474c]">استعادة كلمة المرور</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm px-6 py-8">
        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-3">📧</div>
            <p className="font-semibold text-[#091426] mb-2">تم إرسال رابط الاستعادة</p>
            <p className="text-sm text-[#45474c]">تحقق من بريدك الإلكتروني واتبع التعليمات.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">البريد الإلكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@school.edu" required
                className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm" />
            </div>
            {error && <p className="text-right text-sm text-[#ba1a1a]">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-[#091426] text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-60">
              {loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
            </button>
          </form>
        )}
        <div className="mt-5 text-center">
          <Link href="/login" className="text-sm text-[#45474c] hover:text-[#091426]">→ العودة لتسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
