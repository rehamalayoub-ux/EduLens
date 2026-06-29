"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteEvaluationButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("evaluations").delete().eq("id", id);
    router.push("/evaluations");
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="flex items-center gap-2 border border-[#ffdad6] text-[#ba1a1a] px-4 py-2 rounded-xl text-sm hover:bg-[#ffdad6] transition disabled:opacity-50">
      {loading ? "..." : "حذف التقييم"}
    </button>
  );
}
