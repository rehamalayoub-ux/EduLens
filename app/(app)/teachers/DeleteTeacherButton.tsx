"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteTeacherButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("هل أنت متأكد من حذف هذا المعلم؟")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("teachers").delete().eq("id", id);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-[#ba1a1a] hover:text-[#93000a] transition px-3 py-1.5 rounded-lg hover:bg-[#ffdad6] disabled:opacity-50"
    >
      {loading ? "..." : "حذف"}
    </button>
  );
}
