"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Teacher } from "@/types/database";

interface Props {
  teacher?: Teacher;
}

export default function TeacherForm({ teacher }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: teacher?.name ?? "",
    subject: teacher?.subject ?? "",
    grade_level: teacher?.grade_level ?? "",
    school_department: teacher?.school_department ?? "",
    notes: teacher?.notes ?? "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const payload = { ...form, user_id: user.id };

    if (teacher) {
      const { error } = await supabase.from("teachers").update(payload).eq("id", teacher.id);
      if (error) { setError("حدث خطأ أثناء التحديث"); setLoading(false); return; }
    } else {
      const { error } = await supabase.from("teachers").insert(payload);
      if (error) { setError("حدث خطأ أثناء الحفظ"); setLoading(false); return; }
    }

    router.push("/teachers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm p-8 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="اسم المعلم *" value={form.name} onChange={(v) => update("name", v)} placeholder="أ. محمد أحمد السعيد" required />
        <Field label="المادة الدراسية *" value={form.subject} onChange={(v) => update("subject", v)} placeholder="الرياضيات" required />
        <Field label="الصف *" value={form.grade_level} onChange={(v) => update("grade_level", v)} placeholder="الثامن (أ)" required />
        <Field label="المدرسة / القسم *" value={form.school_department} onChange={(v) => update("school_department", v)} placeholder="مدرسة النور الثانوية" required />
      </div>
      <div className="mt-5">
        <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">ملاحظات</label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="أي ملاحظات إضافية..."
          rows={3}
          className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition resize-none text-sm"
        />
      </div>

      {error && <p className="text-right text-sm text-[#ba1a1a] mt-3">{error}</p>}

      <div className="flex gap-3 justify-start mt-6">
        <button type="button" onClick={() => router.back()} className="px-5 py-3 rounded-xl border border-[#c5c6cd] text-[#45474c] text-sm font-medium hover:bg-[#f2f4f6] transition">
          إلغاء
        </button>
        <button type="submit" disabled={loading} className="px-5 py-3 rounded-xl bg-[#091426] text-white text-sm font-semibold hover:bg-[#1e293b] transition disabled:opacity-60">
          {loading ? "جارٍ الحفظ..." : teacher ? "حفظ التغييرات" : "إضافة المعلم"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-right text-sm font-medium text-[#191c1e] mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition text-sm"
      />
    </div>
  );
}
