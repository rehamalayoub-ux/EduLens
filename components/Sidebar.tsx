"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "لوحة القيادة", href: "/dashboard",      icon: <DashboardIcon /> },
  { label: "المعلمون",     href: "/teachers",        icon: <TeachersIcon /> },
  { label: "التقييمات",   href: "/evaluations",     icon: <EvaluationsIcon /> },
  { label: "تقييم جديد",  href: "/evaluations/new", icon: <NewEvalIcon /> },
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
      <div className="h-20 flex items-center justify-center px-3 border-b border-[#e0e3e5]">
        <Link href="/dashboard">
          <Image src="/logo.svg" alt="EduLens" width={176} height={68} priority />
        </Link>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && item.href !== "/evaluations/new" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center justify-start gap-3 px-4 py-3.5 text-base font-semibold transition ${
                active
                  ? "text-[#091426] bg-[#f2f4f6] border-r-[3px] border-r-[#091426]"
                  : "text-[#45474c] hover:text-[#091426] hover:bg-[#f7f9fb] border-r-[3px] border-r-transparent"
              }`}>
              <span className={active ? "text-[#091426]" : "text-[#75777d]"}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e0e3e5] p-4">
        <button onClick={handleLogout}
          className="w-full flex items-center justify-start gap-2 text-sm text-[#45474c] hover:text-[#ba1a1a] transition">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}

function DashboardIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function TeachersIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function EvaluationsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>; }
function NewEvalIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
