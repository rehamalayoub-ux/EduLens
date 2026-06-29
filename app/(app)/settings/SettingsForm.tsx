"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SettingsForm({ email, fullName, userId }: { email: string; fullName: string; userId: string }) {
  const [name, setName] = useState(fullName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: userId, full_name: name, role: "supervisor" }, { onConflict: "user_id" });
    setSaving(false);
    if (error) { setError("حدث خطأ أثناء الحفظ"); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#091426] text-right mb-5">معلومات الحساب</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">الاسم الكامل</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل"
              className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm" />
          </div>
          <div>
            <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">البريد الإلكتروني</label>
            <input type="email" value={email} disabled
              className="w-full bg-[#eceef0] rounded-xl px-4 py-3 text-right text-[#75777d] text-sm cursor-not-allowed" />
          </div>
          {error && <p className="text-right text-sm text-[#ba1a1a]">{error}</p>}
          <div className="flex items-center gap-3 justify-start">
            {saved && <span className="text-sm text-[#00a64a]">✓ تم الحفظ</span>}
            <button type="submit" disabled={saving} className="bg-[#091426] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-60">
              {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-[#ffdad6] shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#ba1a1a] text-right mb-2">منطقة الخطر</h2>
        <p className="text-sm text-[#45474c] text-right mb-4">حذف الحساب سيؤدي إلى فقدان جميع البيانات نهائياً.</p>
        <button disabled className="border border-[#ba1a1a] text-[#ba1a1a] px-4 py-2 rounded-xl text-sm opacity-50 cursor-not-allowed">
          حذف الحساب (غير متاح في المرحلة الحالية)
        </button>
      </div>
    </div>
  );
}
