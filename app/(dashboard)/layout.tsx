import BottomNav from "@/components/layout/BottomNav";
import { Menu, Bell } from "lucide-react";
import { getCurrentUser, getOrCreateProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  // Ensure profile exists
  await getOrCreateProfile(user);

  return (
    <div className="min-h-dvh bg-[#F5ECD7] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 px-5 pt-4 pb-3 bg-[#F5ECD7]">
        <div className="flex items-center justify-between">
          <button className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#0D1F17]/60 hover:text-[#0D1F17] transition shadow-sm">
            <Menu size={20} />
          </button>

          <h1 className="font-serif text-xl font-bold text-[#0D1F17] tracking-tight">
            Mahjong Night
          </h1>

          <button className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#0D1F17]/60 hover:text-[#0D1F17] transition shadow-sm relative">
            <Bell size={20} />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="px-5 pb-8">
        {children}
      </main>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}
