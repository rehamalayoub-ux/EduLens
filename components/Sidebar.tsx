"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { label: "لوحة القيادة", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "المشرفون", href: "/supervisors", icon: <SupervisorsIcon /> },
  { label: "المعلمون", href: "/teachers", icon: <TeachersIcon /> },
  { label: "التقييمات", href: "/evaluations", icon: <EvaluationsIcon /> },
  { label: "التقارير", href: "/reports", icon: <ReportsIcon /> },
  { label: "الإعدادات", href: "/settings", icon: <SettingsIcon /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-56 min-h-screen bg-white border-l border-[#e0e3e5] flex flex-col fixed right-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center justify-end px-4 border-b border-[#e0e3e5]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="text-right leading-tight">
            <div className="text-sm font-bold text-[#091426]">
              Edu<span className="text-[#00a64a]">Lens</span>
            </div>
            <div className="text-[9px] text-[#45474c]">إديو لينس</div>
          </div>
          <div className="w-8 h-8 shrink-0">
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
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-end gap-3 px-4 py-3 text-sm font-medium transition relative ${
                active
                  ? "text-[#091426] bg-[#f2f4f6] border-r-[3px] border-r-[#091426]"
                  : "text-[#45474c] hover:text-[#091426] hover:bg-[#f7f9fb]"
              }`}
            >
              <span>{item.label}</span>
              <span className={active ? "text-[#091426]" : "text-[#75777d]"}>{item.icon}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#e0e3e5] p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-end gap-2 text-sm text-[#45474c] hover:text-[#ba1a1a] transition"
        >
          <span>تسجيل الخروج</span>
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}

function DashboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function SupervisorsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
}
function TeachersIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function EvaluationsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}
function ReportsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
