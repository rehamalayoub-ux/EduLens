import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fb] flex">
      {/* Sidebar fixed on right (RTL) */}
      <Sidebar />

      {/* Main content — margin-right = sidebar width */}
      <div className="flex-1 flex flex-col mr-56 min-h-screen">
        <TopBar />
        <main className="flex-1 px-8 py-6 max-w-[1200px] w-full" dir="rtl">
          {children}
        </main>
      </div>
    </div>
  );
}
