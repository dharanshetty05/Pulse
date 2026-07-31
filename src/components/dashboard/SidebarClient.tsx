"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Clock,
  Download,
  Zap,
  Folder,
  Plus,
  History,
  Pin,
  Calendar,
  ThumbsUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { createGroupAction } from "@/app/actions/groups";
import { Group, Company } from "@prisma/client";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Follow Ups", href: "/followups", icon: Clock },
  { label: "Import Queue", href: "/dashboard/import-queue", icon: Download },
];

interface Props {
  groups: (Group & { _count: { companies: number } })[];
  pinnedCompanies: Company[];
}

export function addRecentlyViewed(company: { id: string, name: string }) {
  try {
    const existingStr = localStorage.getItem("pulse-recently-viewed");
    let existing: { id: string, name: string }[] = existingStr ? JSON.parse(existingStr) : [];
    existing = existing.filter(c => c.id !== company.id);
    existing.unshift(company);
    if (existing.length > 10) existing = existing.slice(0, 10);
    localStorage.setItem("pulse-recently-viewed", JSON.stringify(existing));
    window.dispatchEvent(new Event("recently-viewed-updated"));
  } catch (e) {}
}

export default function SidebarClient({ groups, pinnedCompanies }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const existingStr = localStorage.getItem("pulse-recently-viewed");
        if (existingStr) setRecentlyViewed(JSON.parse(existingStr));
      } catch (e) {}
    };
    loadRecentlyViewed();
    window.addEventListener("recently-viewed-updated", loadRecentlyViewed);
    return () => window.removeEventListener("recently-viewed-updated", loadRecentlyViewed);
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await createGroupAction(newGroupName);
    setNewGroupName("");
    setIsCreatingGroup(false);
    router.refresh();
  };

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

        {/* Pinned Companies */}
        {pinnedCompanies.length > 0 && (
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="flex items-center px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Pinned
              </span>
            </div>
            <div className="space-y-0.5">
              {pinnedCompanies.map(c => (
                <Link
                  key={c.id}
                  href={`/companies?preview=${c.id}`}
                  className="group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  <Pin className="w-3.5 h-3.5 text-orange-400 shrink-0 fill-orange-400/20" />
                  <span className="text-gray-500 group-hover:text-gray-900 truncate font-medium">
                    {c.businessName}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Follow-Up Workspace */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Follow-Up Workspace
            </span>
          </div>
          <div className="space-y-0.5">
            <Link href="/companies?status=FOLLOW_UP" className="group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors">
              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-gray-500 group-hover:text-gray-900 truncate font-medium">Needs Follow Up</span>
            </Link>
            <Link href="/companies?status=INTERESTED" className="group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors">
              <ThumbsUp className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className="text-gray-500 group-hover:text-gray-900 truncate font-medium">Interested</span>
            </Link>
            <Link href="/companies?followup=today" className="group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-gray-500 group-hover:text-gray-900 truncate font-medium">Today's Follow Ups</span>
            </Link>
            <Link href="/companies?followup=overdue" className="group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors">
              <Clock className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-gray-500 group-hover:text-gray-900 truncate font-medium text-red-600">Overdue</span>
            </Link>
            <Link href="/companies?followup=upcoming" className="group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-gray-500 group-hover:text-gray-900 truncate font-medium">Upcoming</span>
            </Link>
          </div>
        </div>

        {/* Groups */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Groups
            </span>
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-100"
              title="New Group"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            <AnimatePresence>
              {isCreatingGroup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-3 py-1.5 overflow-hidden"
                >
                  <form onSubmit={handleCreateGroup} className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Group name..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onBlur={() => {
                        if (!newGroupName.trim()) setIsCreatingGroup(false);
                      }}
                      className="w-full text-sm px-2 py-1 bg-gray-50 border border-gray-200 rounded outline-none focus:border-gray-400"
                    />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {groups.map((group) => {
              const params = new URLSearchParams();
              params.set("group", group.name);
              const href = `/companies?${params.toString()}`;

              return (
                <Link
                  key={group.id}
                  href={href}
                  className="group flex items-center justify-between px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 shrink-0" />
                    <span className="text-gray-500 group-hover:text-gray-900 truncate font-medium">
                      {group.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium bg-gray-50 group-hover:bg-gray-100 px-1.5 py-0.5 rounded-md tabular-nums shrink-0">
                    {group._count.companies}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="px-3 py-2 mb-4">
            <div className="flex items-center px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Recently Viewed
              </span>
            </div>
            <div className="space-y-0.5">
              {recentlyViewed.map(c => (
                <Link
                  key={c.id}
                  href={`/companies?preview=${c.id}`}
                  className="group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm hover:bg-gray-50 transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-500 group-hover:text-gray-900 truncate font-medium">
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
