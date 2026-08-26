"use client";

import { Company, Status } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Inbox, Trash2, Globe, Heart, Mail, Phone } from "lucide-react";
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { deleteCompanyAction } from "@/app/actions/deleteCompany";
import { updateCompanyAction } from "@/app/actions/updateCompany";
import { motion, AnimatePresence, easeOut, type Variants } from "framer-motion";

const rowVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.2,
      ease: easeOut,
    },
  }),
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.2,
    },
  },
};

interface Props {
  companies: Company[];
  isSearchActive?: boolean;
}

// Track optimistic updates for each company field
type OptimisticUpdate = {
  companyId: string;
  field: string;
  previousValue: string | null;
  newValue: string;
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
    </div>
  );
}

export default function CompaniesTable({ companies: initialCompanies, isSearchActive }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [optimisticDeletes, setOptimisticDeletes] = useState<Set<string>>(new Set());
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]);

  // Apply optimistic updates to companies
  const companies = useCallback(() => {
    return initialCompanies.map(company => {
      const updates = optimisticUpdates.filter(u => u.companyId === company.id);
      if (updates.length === 0) return company;
      
      const updatedCompany = { ...company };
      updates.forEach(u => {
        (updatedCompany as any)[u.field] = u.newValue;
      });
      return updatedCompany;
    });
  }, [initialCompanies, optimisticUpdates])();

  const visibleCompanies = companies.filter((c) => !optimisticDeletes.has(c.id));

  const handleUpdateField = async (id: string, field: string, value: string) => {
    // Find the company to get the previous value
    const company = initialCompanies.find(c => c.id === id);
    const previousValue = company ? (company as any)[field] : null;
    
    // Apply optimistic update immediately
    setOptimisticUpdates(prev => [
      ...prev.filter(u => !(u.companyId === id && u.field === field)),
      { companyId: id, field, previousValue, newValue: value }
    ]);

    try {
      await updateCompanyAction(id, { [field]: value });
      // On success, remove from optimistic updates (server data will match)
      setOptimisticUpdates(prev => prev.filter(u => !(u.companyId === id && u.field === field)));
      toast({ type: "success", message: "Updated" });
    } catch (error) {
      // On error, revert optimistic update
      setOptimisticUpdates(prev => prev.filter(u => !(u.companyId === id && u.field === field)));
      toast({ type: "error", message: "Failed to update. Please try again." });
    }
  };

  const handleStatusChange = async (id: string, newStatus: Status) => {
    const company = initialCompanies.find(c => c.id === id);
    const previousValue = company?.status || null;
    
    // Apply optimistic update immediately
    setOptimisticUpdates(prev => [
      ...prev.filter(u => !(u.companyId === id && u.field === 'status')),
      { companyId: id, field: 'status', previousValue, newValue: newStatus }
    ]);

    try {
      await updateCompanyAction(id, { status: newStatus });
      setOptimisticUpdates(prev => prev.filter(u => !(u.companyId === id && u.field === 'status')));
      toast({ type: "success", message: "Status updated" });
    } catch (error) {
      setOptimisticUpdates(prev => prev.filter(u => !(u.companyId === id && u.field === 'status')));
      toast({ type: "error", message: "Failed to update status. Please try again." });
    }
  };

  const handleDelete = (id: string, businessName: string) => {
    setOptimisticDeletes((prev) => new Set(prev).add(id));
    
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

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
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
                  <td colSpan={6}>
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
                      ${i === visibleCompanies.length - 1 ? "border-b-0" : ""}
                    `}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5 items-start">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-gray-500 transition-colors" strokeWidth={1.5} />
                          <span className="font-medium text-gray-900 leading-tight cursor-pointer hover:underline">
                            {company.businessName}
                          </span>
                        </div>
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
                        onChange={(e) => handleStatusChange(company.id, e.target.value as Status)}
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
