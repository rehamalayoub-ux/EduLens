"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/teachers?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="h-16 bg-white border-b border-[#e0e3e5] flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left: avatar + icons */}
      <div className="flex items-center gap-3">
        <button className="text-[#45474c] hover:text-[#091426] transition">
          <BellIcon />
        </button>
        <button className="text-[#45474c] hover:text-[#091426] transition">
          <TranslateIcon />
        </button>
        <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center overflow-hidden">
          <UserIcon />
        </div>
      </div>

      {/* Center: search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="البحث عن معلم، تقييم..."
            className="w-full bg-[#f2f4f6] rounded-xl py-2.5 pr-4 pl-10 text-right text-sm text-[#191c1e] placeholder-[#75777d] outline-none focus:ring-2 focus:ring-[#1e293b] transition"
          />
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d]">
            <SearchIcon />
          </button>
        </div>
      </form>

      {/* Right: empty space (logo is in sidebar) */}
      <div className="w-9" />
    </header>
  );
}

function BellIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function TranslateIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>;
}
function UserIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
