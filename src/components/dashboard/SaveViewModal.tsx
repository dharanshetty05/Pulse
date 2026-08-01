"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { createSavedViewAction } from "@/app/actions/savedViews";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface Props {
  currentFilters: string;
  onClose: () => void;
}

export default function SaveViewModal({ currentFilters, onClose }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    
    // We assume currentFilters is the window.location.search string
    const res = await createSavedViewAction(name.trim(), currentFilters);
    setIsSaving(false);
    
    if (res.error) {
      toast({ type: "error", message: res.error });
    } else {
      toast({ type: "success", message: "View saved" });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Save Current View</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <p className="text-sm text-gray-500">
            This will save all active filters, tags, groups, and search terms so you can quickly restore this view from the sidebar.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">View Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hot Leads"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || isSaving} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50">
              {isSaving ? "Saving..." : "Save View"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
