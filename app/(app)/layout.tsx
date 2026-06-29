import Navbar from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <Navbar />
      <main className="max-w-[1440px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
