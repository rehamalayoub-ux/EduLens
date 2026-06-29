"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EditCommentsForm({ evaluationId, initialComments }: { evaluationId: string; initialComments: string }) {
  const [comments, setComments] = useState(initialComments);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("evaluations").update({ final_comments: comments }).eq("id", evaluationId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="أضف تعليقاتك الختامية هنا..."
        rows={4}
        className="w-full bg-[#f2f4f6] rounded-xl px-4 py-3 text-right text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition resize-none text-sm"
      />
      <div className="flex items-center justify-start gap-3 mt-3 print:hidden">
        {saved && <span className="text-sm text-[#00a64a]">✓ تم الحفظ</span>}
        <button onClick={handleSave} disabled={saving} className="bg-[#091426] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1e293b] transition disabled:opacity-60">
          {saving ? "جارٍ الحفظ..." : "حفظ التعليقات"}
        </button>
      </div>
    </div>
  );
}
