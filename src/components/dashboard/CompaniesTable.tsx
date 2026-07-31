"use client";

import { Company, Status } from "@prisma/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, Inbox, Edit3, Trash2, Globe, Heart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { deleteCompanyAction } from "@/app/actions/deleteCompany";
import { updateCompanyAction } from "@/app/actions/updateCompany";

interface Props {
  companies: Company[];
  isSearchActive?: boolean;
}

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.2,
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

export default function CompaniesTable({ companies, isSearchActive }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [optimisticDeletes, setOptimisticDeletes] = useState<Set<string>>(new Set());

  // Filter out optimistically deleted items
  const visibleCompanies = companies.filter((c) => !optimisticDeletes.has(c.id));

  const toggleAll = () => {
    if (selectedIds.size === visibleCompanies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleCompanies.map((c) => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDelete = (id: string, businessName: string) => {
    // 1. Optimistic hide
    setOptimisticDeletes((prev) => new Set(prev).add(id));
    if (selectedIds.has(id)) toggleOne(id);
    
    // 2. Set timeout for actual deletion
    let isUndone = false;
    
    const timeoutId = setTimeout(() => {
      if (!isUndone) {
        deleteCompanyAction(id).then(() => {
          router.refresh();
        });
      }
    }, 5000);

    // 3. Show undo toast
    toast({
      type: "undo",
      message: `${businessName} deleted`,
      duration: 5000,
      onUndo: () => {
        isUndone = true;
        clearTimeout(timeoutId);
        setOptimisticDeletes((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast({ type: "success", message: "Deletion undone", duration: 2000 });
      },
    });
  };

  const handleBulkDelete = () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    setOptimisticDeletes((prev) => {
      const next = new Set(prev);
      idsToDelete.forEach((id) => next.add(id));
      return next;
    });
    setSelectedIds(new Set());
    
    let isUndone = false;
    const timeoutId = setTimeout(() => {
      if (!isUndone) {
        Promise.all(idsToDelete.map(id => deleteCompanyAction(id))).then(() => {
          router.refresh();
        });
      }
    }, 5000);

    toast({
      type: "undo",
      message: `${idsToDelete.length} companies deleted`,
      duration: 5000,
      onUndo: () => {
        isUndone = true;
        clearTimeout(timeoutId);
        setOptimisticDeletes((prev) => {
          const next = new Set(prev);
          idsToDelete.forEach(id => next.delete(id));
          return next;
        });
        setSelectedIds(new Set(idsToDelete));
        toast({ type: "success", message: "Deletion undone", duration: 2000 });
      },
    });
  };

  const handleBulkStatus = async (status: Status) => {
    const idsToUpdate = Array.from(selectedIds);
    if (idsToUpdate.length === 0) return;
    
    await Promise.all(idsToUpdate.map(id => updateCompanyAction(id, status))); 
    toast({ type: "success", message: `Updated ${idsToUpdate.length} companies` });
    setSelectedIds(new Set());
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <span className="font-medium bg-white/20 px-2 py-0.5 rounded-md">
                {selectedIds.size} selected
              </span>
              <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Change Status:</span>
                <select 
                  className="bg-transparent text-white text-sm outline-none cursor-pointer"
                  onChange={(e) => handleBulkStatus(e.target.value as Status)}
                  value=""
                >
                  <option value="" disabled className="text-gray-900">Select...</option>
                  <option value="NEW" className="text-gray-900">New</option>
                  <option value="CONTACTED" className="text-gray-900">Contacted</option>
                  <option value="FOLLOW_UP" className="text-gray-900">Follow Up</option>
                  <option value="INTERESTED" className="text-gray-900">Interested</option>
                  <option value="MEETING_BOOKED" className="text-gray-900">Meeting Booked</option>
                  <option value="CLIENT" className="text-gray-900">Client</option>
                  <option value="CLOSED" className="text-gray-900">Closed</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={visibleCompanies.length > 0 && selectedIds.size === visibleCompanies.length}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Business
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Links
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Updated
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {visibleCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                      <Inbox className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-gray-500">
                        {isSearchActive ? "No matches found" : "No companies yet"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isSearchActive 
                          ? "Try adjusting your search or filters." 
                          : "Add your first company or import a CSV."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visibleCompanies.map((company, i) => (
                  <motion.tr
                    key={company.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={rowVariants}
                    className={`
                      group relative border-b border-gray-100 transition-colors
                      hover:bg-gray-50/80
                      ${selectedIds.has(company.id) ? "bg-gray-50/80" : ""}
                      ${i === visibleCompanies.length - 1 ? "border-b-0" : ""}
                    `}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(company.id)}
                        onChange={() => toggleOne(company.id)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => router.push(`/companies/${company.id}`)}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-300 group-hover:text-gray-400 transition-colors" strokeWidth={1.5} />
                        <span className="font-medium text-gray-900 leading-tight">
                          {company.businessName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {company.website ? (
                          <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors" title="Website">
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-gray-200"><Globe className="h-3.5 w-3.5" /></span>
                        )}
                        {company.instagram ? (
                          <a href={`https://instagram.com/${company.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" title="Instagram">
                            <Heart className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-gray-200"><Heart className="h-3.5 w-3.5" /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 cursor-pointer" onClick={() => router.push(`/companies/${company.id}`)}>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="h-3 w-3 shrink-0 text-gray-300" strokeWidth={1.5} />
                        <span className="text-xs">{company.city || <span className="text-gray-300">—</span>}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={company.status}
                        onChange={(e) => {
                          updateCompanyAction(company.id, e.target.value as Status);
                          toast({ type: "success", message: "Status updated" });
                          router.refresh();
                        }}
                        className="text-xs appearance-none bg-transparent cursor-pointer outline-none hover:bg-gray-100 px-1 py-0.5 rounded transition-colors"
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="FOLLOW_UP">Follow Up</option>
                        <option value="INTERESTED">Interested</option>
                        <option value="MEETING_BOOKED">Meeting Booked</option>
                        <option value="CLIENT">Client</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs tabular-nums cursor-pointer" onClick={() => router.push(`/companies/${company.id}`)}>
                      {company.updatedAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/companies/${company.id}`)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id, company.businessName)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
