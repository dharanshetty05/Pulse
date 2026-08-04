"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Building2, Clock, Download, Zap, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Follow Ups", href: "/followups", icon: Clock },
  { label: "Import Queue", href: "/dashboard/import-queue", icon: Download },
];

export default function SidebarClient() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-100 min-h-screen flex flex-col bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0 group-hover:bg-gray-700 transition-colors duration-150">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            Pulse
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Main Nav */}
        <nav className="px-3 py-4 space-y-0.5 border-b border-gray-100">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-100 group outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md bg-gray-100"
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  />
                )}
                <Icon
                  className={`relative w-4 h-4 shrink-0 transition-colors duration-100 ${
                    isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span
                  className={`relative font-medium transition-colors duration-100 ${
                    isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-800"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User / Logout */}
      <div className="px-3 py-4 mt-auto border-t border-gray-100 shrink-0">
        <button
          onClick={async () => {
            await signOut();
            router.push("/login");
            router.refresh();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-900 group"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
