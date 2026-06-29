"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { label: "الإعدادات", href: "/settings" },
  { label: "سجل التقييمات", href: "/evaluations" },
  { label: "المعلمون", href: "/teachers" },
  { label: "لوحة التحكم", href: "/dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="bg-white border-b border-[#e0e3e5] sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Notification + Avatar (right in RTL = visually left in LTR) */}
        <div className="flex items-center gap-3">
          <button className="relative text-[#45474c] hover:text-[#091426] transition">
            <BellIcon />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white text-sm font-semibold overflow-hidden"
            >
              <UserIcon />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-12 bg-white rounded-xl shadow-lg border border-[#e0e3e5] py-2 w-40 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#f2f4f6] transition"
                >
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  active
                    ? "text-[#091426] border-b-2 border-[#091426] rounded-none"
                    : "text-[#45474c] hover:text-[#091426] hover:bg-[#f2f4f6]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="20" height="25" rx="2" fill="#e8f0fe" stroke="#1e293b" strokeWidth="1.2"/>
              <line x1="7" y1="11" x2="21" y2="11" stroke="#1e293b" strokeWidth="1" strokeLinecap="round"/>
              <line x1="7" y1="15" x2="21" y2="15" stroke="#1e293b" strokeWidth="1" strokeLinecap="round"/>
              <line x1="7" y1="19" x2="16" y2="19" stroke="#1e293b" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="22" cy="22" r="7" fill="white" stroke="#1e293b" strokeWidth="1.2"/>
              <circle cx="22" cy="22" r="3" fill="#1e293b"/>
              <circle cx="23" cy="21" r="0.8" fill="white"/>
            </svg>
          </div>
          <div className="text-right leading-tight">
            <div className="text-sm font-bold text-[#091426]">
              Edu<span className="text-[#00a64a]">Lens</span>
            </div>
            <div className="text-[9px] text-[#45474c]">إديو لينس</div>
          </div>
        </Link>
      </div>
    </header>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
