"use client";

import { useState } from "react";
import { Tag } from "@prisma/client";
import { X, Plus, Trash2, Edit2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TAG_COLORS, getTagColorClasses } from "@/lib/tagColors";
import { createTagAction, deleteTagAction, updateTagAction } from "@/app/actions/tags";
import { useToast } from "@/components/ui/toast";

interface Props {
  tags: (Tag & { _count?: { companies: number } })[];
  onClose: () => void;
}

export default function TagManagementModal({ tags, onClose }: Props) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("gray");

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setNewName("");
    setNewColor("gray");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await createTagAction(newName.trim(), newColor);
    if (res.error) {
      toast({ type: "error", message: res.error });
    } else {
      toast({ type: "success", message: "Tag created" });
      resetForm();
    }
  };

  const handleUpdate = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await updateTagAction(id, { name: newName.trim(), color: newColor });
    if (res.error) {
      toast({ type: "error", message: res.error });
    } else {
      toast({ type: "success", message: "Tag updated" });
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this tag? It will be removed from all companies.")) {
      await deleteTagAction(id);
      toast({ type: "success", message: "Tag deleted" });
    }
  };

  const openEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setNewName(tag.name);
    setNewColor(tag.color);
    setIsCreating(false);
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Manage Tags</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!isCreating && !editingId && (
            <button 
              onClick={openCreate}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Tag
            </button>
          )}

          <AnimatePresence mode="popLayout">
            {(isCreating || editingId) && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={(e) => isCreating ? handleCreate(e) : handleUpdate(editingId!, e)}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tag Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. High Priority"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLORS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewColor(c.id)}
                        className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${c.bg} ${
                          newColor === c.id ? "border-gray-900 scale-110" : "border-transparent hover:scale-110"
                        }`}
                      >
                        {newColor === c.id && <Check className={`w-3 h-3 ${c.text}`} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={resetForm} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={!newName.trim()} className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50">
                    {isCreating ? "Create Tag" : "Save Changes"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getTagColorClasses(tag.color)}`}>
                    {tag.name}
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums font-medium">
                    {tag._count?.companies || 0} companies
                  </span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(tag)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(tag.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {tags.length === 0 && !isCreating && (
              <div className="text-center py-6 text-sm text-gray-500">
                No tags created yet.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
