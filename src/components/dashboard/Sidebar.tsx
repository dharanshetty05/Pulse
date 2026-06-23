"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Clock,
  Plus,
  Zap,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Leads",
    href: "/leads",
    icon: Users,
  },
  {
    label: "Follow Ups",
    href: "/followups",
    icon: Clock,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-100 min-h-screen flex flex-col bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0 group-hover:bg-gray-700 transition-colors duration-150">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            Outreach OS
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
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
                  isActive
                    ? "text-gray-900"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              <span
                className={`relative font-medium transition-colors duration-100 ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-500 group-hover:text-gray-800"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Add Lead CTA */}
      <div className="px-3 pb-5">
        <Link
          href="/leads/new"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md bg-gray-900 hover:bg-gray-700 active:bg-gray-800 text-white text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </Link>
      </div>
    </aside>
  );
}