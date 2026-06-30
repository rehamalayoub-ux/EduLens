"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل"); return; }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) { setError("حدث خطأ أثناء إنشاء الحساب"); setLoading(false); return; }

    if (data.user) {
      // Role assignment happens server-side to prevent client tampering
      await fetch("/api/create-profile", { method: "POST" });
    }
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm px-8 py-10 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-lg font-bold text-[#091426] mb-2">تم إنشاء الحساب بنجاح!</h2>
          <p className="text-sm text-[#45474c] mb-6">تحقق من بريدك الإلكتروني لتأكيد الحساب.</p>
          <Link href="/login" className="block w-full bg-[#091426] text-white font-semibold py-3 rounded-xl text-sm text-center">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-4">
      <div className="mb-6 text-center">
        <p className="text-xl font-bold text-[#091426]">Edu<span className="text-[#00a64a]">Lens</span></p>
        <p className="text-sm text-[#45474c]">إنشاء حساب جديد</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm px-6 py-8">
        <form onSubmit={handleRegister} className="space-y-4">
          <Field label="الاسم الكامل *" value={fullName} onChange={setFullName} placeholder="أ. محمد أحمد" type="text" required />
          <Field label="البريد الإلكتروني *" value={email} onChange={setEmail} placeholder="example@school.edu" type="email" required />
          <Field label="كلمة المرور *" value={password} onChange={setPassword} placeholder="••••••••" type="password" required />
          {error && <p className="text-right text-sm text-[#ba1a1a]">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-[#091426] hover:bg-[#1e293b] text-white font-semibold py-3.5 rounded-xl transition text-sm disabled:opacity-60">
            {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>
        <div className="mt-6 border-t border-[#e0e3e5] pt-5 text-center">
          <p className="text-sm text-[#45474c] mb-3">لديك حساب بالفعل؟</p>
          <Link href="/login" className="w-full block border border-[#c5c6cd] rounded-xl py-3 text-sm font-semibold text-[#191c1e] hover:bg-[#f2f4f6] transition text-center">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm" />
    </div>
  );
}
