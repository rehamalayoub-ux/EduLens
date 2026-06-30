"use client";
import { useState } from "react";

export default function TeacherProfileAvatar({
  initials,
  defaultPhoto,
}: {
  initials: string;
  defaultPhoto?: string;
}) {
  const [photo, setPhoto] = useState<string | null>(defaultPhoto ?? null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <label className="relative cursor-pointer group shrink-0">
      <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-[#091426] shadow-md border-2 border-[#e0e3e5]">
        {photo ? (
          <img src={photo} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-lg font-bold">{initials}</span>
        )}
      </div>
      {/* Upload icon badge */}
      <div className="absolute bottom-0 left-0 w-5 h-5 bg-[#00a64a] rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
    </label>
  );
}
