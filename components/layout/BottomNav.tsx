"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Trophy, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/sessions", label: "Games", Icon: LayoutGrid },
  { href: "/leaderboard", label: "Ranks", Icon: Trophy },
  { href: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-jade/90 backdrop-blur-xl border-t border-white/5" />

      {/* Nav content */}
      <div className="relative flex items-center justify-around px-2 py-2 pb-[max(12px,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all"
            >
              <div
                className={`p-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-gold/15 text-gold shadow-lg shadow-gold/10"
                    : "text-cream/40 hover:text-cream/60"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  isActive ? "text-gold" : "text-cream/40"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
