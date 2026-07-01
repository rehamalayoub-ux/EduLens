"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type TeacherCardData = {
  id: string; name: string; subject: string; grade_level: string;
  visits: number; avg_score: number | null; status: string; photo?: string;
};

const AVATAR_COLORS = ["#7c3aed","#0891b2","#be185d","#059669","#d97706","#dc2626","#2563eb","#0d9488"];

function pickColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function TeacherCard({ teacher: t, isDemo = false, onDelete }: {
  teacher: TeacherCardData;
  isDemo?: boolean;
  onDelete?: (id: string) => void;
}) {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(t.photo ?? null);
  const [photoError, setPhotoError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const initials = t.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
  const avatarColor = pickColor(t.name);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      if (isDemo) {
        onDelete?.(t.id);
        return;
      }
      const res = await fetch(`/api/teachers/${t.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete?.(t.id);
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const scoreColor = t.avg_score
    ? t.avg_score >= 90 ? "#00a64a" : t.avg_score >= 75 ? "#f59e0b" : "#ba1a1a"
    : "#c5c6cd";

  return (
    <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm overflow-hidden flex flex-col" dir="rtl">

      {/* Avatar + upload + delete */}
      <div className="bg-[#f7f9fb] px-5 pt-5 pb-4 flex flex-col items-center text-center relative">

        {/* Delete button */}
        <div className="absolute top-3 left-3">
          {confirmDelete ? (
            <div className="flex gap-1">
              <button onClick={() => setConfirmDelete(false)}
                className="text-[10px] px-2 py-1 rounded-lg bg-[#f2f4f6] text-[#45474c] hover:bg-[#e0e3e5] transition">
                إلغاء
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="text-[10px] px-2 py-1 rounded-lg bg-[#ba1a1a] text-white hover:bg-[#9b1515] transition">
                {deleting ? "..." : "تأكيد"}
              </button>
            </div>
          ) : (
            <button onClick={handleDelete}
              title="حذف المعلم"
              className="w-7 h-7 rounded-full bg-white border border-[#e0e3e5] flex items-center justify-center text-[#ba1a1a] hover:bg-[#fff1f1] hover:border-[#ba1a1a] transition shadow-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          )}
        </div>

        <label className="relative cursor-pointer group mb-3">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#c5c6cd] group-hover:border-[#091426] transition flex items-center justify-center overflow-hidden shadow"
            style={{ background: photo && !photoError ? "white" : avatarColor }}>
            {photo && !photoError ? (
              <img src={photo} alt={t.name} className="w-full h-full object-cover rounded-full"
                onError={() => setPhotoError(true)} />
            ) : (
              <span className="text-2xl font-bold text-white">{initials}</span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#091426] rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </label>

        <h3 className="font-bold text-[#091426] text-base leading-tight">{t.name}</h3>
        <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
          <span className="px-2.5 py-0.5 bg-[#e8f0fe] text-[#3b5bdb] text-[11px] font-semibold rounded-full">{t.grade_level}</span>
          <span className="px-2.5 py-0.5 bg-[#f2f4f6] text-[#45474c] text-[11px] font-semibold rounded-full">{t.subject}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-[#f2f4f6] px-5 py-4 grid grid-cols-2 gap-3">
        <div className="bg-[#f7f9fb] rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#091426]">{t.visits}</p>
          <p className="text-[10px] text-[#75777d] mt-0.5">عدد الزيارات</p>
        </div>
        <div className="bg-[#f7f9fb] rounded-xl p-3 text-center">
          <p className="text-xl font-bold" style={{ color: scoreColor }}>
            {t.avg_score ? `${t.avg_score}%` : "—"}
          </p>
          <p className="text-[10px] text-[#75777d] mt-0.5">التقييم الكلي</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-col gap-2 mt-auto">
        <Link href={`/evaluations/new?teacher=${t.id}`}
          className="w-full text-center bg-[#091426] hover:bg-[#1e293b] text-white text-xs font-semibold py-2.5 rounded-xl transition">
          تقييم جديد
        </Link>
        <Link href={`/teachers/${t.id}`}
          className="w-full text-center border border-[#c5c6cd] text-[#45474c] hover:bg-[#f2f4f6] text-xs font-medium py-2.5 rounded-xl transition">
          عرض ملف المعلم
        </Link>
      </div>
    </div>
  );
}
