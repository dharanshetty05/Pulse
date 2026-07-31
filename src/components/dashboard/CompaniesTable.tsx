"use client";

import { Company, Status, Group } from "@prisma/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, Inbox, Edit3, Trash2, Globe, Heart, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { deleteCompanyAction } from "@/app/actions/deleteCompany";
import { updateCompanyAction } from "@/app/actions/updateCompany";

interface CompanyWithGroups extends Company {
  groups: Group[];
}

interface Props {
  companies: CompanyWithGroups[];
  groups: Group[];
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

function EditableCell({ 
  value, 
  onSave, 
  placeholder = "—", 
  type = "text",
  icon: Icon
}: { 
  value: string | null, 
  onSave: (val: string) => void, 
  placeholder?: string, 
  type?: string,
  icon?: any
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || "");

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 w-full">
        {Icon && <Icon className="h-3 w-3 shrink-0 text-gray-400" strokeWidth={1.5} />}
        <input
          autoFocus
          type={type}
          value={currentValue}
          onChange={e => setCurrentValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            if (currentValue !== (value || "")) {
              onSave(currentValue);
            }
          }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              setIsEditing(false);
              if (currentValue !== (value || "")) {
                onSave(currentValue);
              }
            }
            if (e.key === "Escape") {
              setIsEditing(false);
              setCurrentValue(value || "");
            }
          }}
          className="w-full bg-white border border-gray-300 rounded px-1 py-0.5 text-xs text-gray-900 outline-none focus:ring-1 focus:ring-gray-900 min-w-[80px]"
        />
      </div>
    );
  }

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
      className="flex items-center gap-1.5 cursor-text hover:bg-gray-100 px-1 py-0.5 rounded -ml-1 transition-colors w-full group/cell"
      title="Click to edit"
    >
      {Icon && <Icon className={`h-3 w-3 shrink-0 ${value ? 'text-gray-400' : 'text-gray-300'}`} strokeWidth={1.5} />}
      <span className={`text-xs truncate ${value ? 'text-gray-600' : 'text-gray-300'}`}>
        {value || placeholder}
      </span>
      <Edit3 className="h-2.5 w-2.5 text-gray-400 opacity-0 group-hover/cell:opacity-100 ml-auto" />
    </div>
  );
}

export default function CompaniesTable({ companies, groups, isSearchActive }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [optimisticDeletes, setOptimisticDeletes] = useState<Set<string>>(new Set());

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

  const handleUpdateField = async (id: string, field: string, value: string) => {
    await updateCompanyAction(id, { [field]: value });
    toast({ type: "success", message: "Updated" });
  };

  const handleDelete = (id: string, businessName: string) => {
    setOptimisticDeletes((prev) => new Set(prev).add(id));
    if (selectedIds.has(id)) toggleOne(id);
    
    let isUndone = false;
    const timeoutId = setTimeout(() => {
      if (!isUndone) {
        deleteCompanyAction(id).then(() => router.refresh());
      }
    }, 5000);

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
        Promise.all(idsToDelete.map(id => deleteCompanyAction(id))).then(() => router.refresh());
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
    
    await Promise.all(idsToUpdate.map(id => updateCompanyAction(id, { status }))); 
    toast({ type: "success", message: `Updated ${idsToUpdate.length} companies` });
    setSelectedIds(new Set());
    router.refresh();
  };

  const handleBulkGroup = async (groupId: string, action: "connect" | "disconnect") => {
    const idsToUpdate = Array.from(selectedIds);
    if (idsToUpdate.length === 0) return;

    const payload = action === "connect" ? { connectGroup: groupId } : { disconnectGroup: groupId };
    await Promise.all(idsToUpdate.map(id => updateCompanyAction(id, payload)));
    toast({ type: "success", message: `Updated ${idsToUpdate.length} companies` });
    setSelectedIds(new Set());
    router.refresh();
  };

  const openPreview = (id: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("preview", id);
    router.push(`/companies?${searchParams.toString()}`, { scroll: false });
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
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-medium bg-white/20 px-2 py-0.5 rounded-md">
                {selectedIds.size} selected
              </span>
              
              <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Status:</span>
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

              <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Add to Group:</span>
                <select 
                  className="bg-transparent text-white text-sm outline-none cursor-pointer w-24 truncate"
                  onChange={(e) => handleBulkGroup(e.target.value, "connect")}
                  value=""
                >
                  <option value="" disabled className="text-gray-900">Select...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="text-gray-900">{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Remove from Group:</span>
                <select 
                  className="bg-transparent text-white text-sm outline-none cursor-pointer w-24 truncate"
                  onChange={(e) => handleBulkGroup(e.target.value, "disconnect")}
                  value=""
                >
                  <option value="" disabled className="text-gray-900">Select...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id} className="text-gray-900">{g.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors shrink-0 ml-4"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={visibleCompanies.length > 0 && selectedIds.size === visibleCompanies.length}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Business
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-48">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-48">
                Social
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-32">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-36">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-gray-500 transition-colors" strokeWidth={1.5} />
                        <span className="font-medium text-gray-900 leading-tight cursor-pointer hover:underline" onClick={() => openPreview(company.id)}>
                          {company.businessName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        <EditableCell value={company.email} onSave={(val) => handleUpdateField(company.id, 'email', val)} placeholder="Email" type="email" icon={Mail} />
                        <EditableCell value={company.phone} onSave={(val) => handleUpdateField(company.id, 'phone', val)} placeholder="Phone" type="tel" icon={Phone} />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        <EditableCell value={company.website} onSave={(val) => handleUpdateField(company.id, 'website', val)} placeholder="Website" type="url" icon={Globe} />
                        <EditableCell value={company.instagram} onSave={(val) => handleUpdateField(company.id, 'instagram', val)} placeholder="Instagram" type="text" icon={Heart} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <EditableCell value={company.city} onSave={(val) => handleUpdateField(company.id, 'city', val)} placeholder="City" icon={MapPin} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={company.status}
                        onChange={async (e) => {
                          await updateCompanyAction(company.id, { status: e.target.value as Status });
                          toast({ type: "success", message: "Status updated" });
                        }}
                        className="text-xs font-medium appearance-none bg-transparent cursor-pointer outline-none hover:bg-gray-100 px-1.5 py-1 rounded transition-colors w-full"
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
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openPreview(company.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          title="Open preview"
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
