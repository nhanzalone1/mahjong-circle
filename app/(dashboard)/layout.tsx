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
    <div className="min-h-dvh bg-jade pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 px-5 pt-4 pb-3 bg-gradient-to-b from-jade via-jade to-transparent">
        <div className="flex items-center justify-between">
          <button className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-cream/80 hover:text-cream transition shadow-card">
            <Menu size={20} />
          </button>

          <h1 className="font-serif text-xl font-bold text-cream tracking-tight">
            Mahjong Night
          </h1>

          <button className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-cream/80 hover:text-cream transition shadow-card relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-green rounded-full ring-2 ring-jade" />
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
