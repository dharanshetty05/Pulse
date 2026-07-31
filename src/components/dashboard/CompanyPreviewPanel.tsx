"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronLeft, ChevronRight, Copy, ExternalLink, 
  MapPin, Globe, Mail, Phone, Heart, Calendar, Clock,
  Pin, Trash2, Send
} from "lucide-react";
import { getCompanyDetailsAction } from "@/app/actions/getCompany";
import { updateCompanyAction } from "@/app/actions/updateCompany";
import { createNoteAction, deleteNoteAction } from "@/app/actions/notes";
import { useToast } from "@/components/ui/toast";
import { addRecentlyViewed } from "./SidebarClient";
import { Status } from "@prisma/client";

interface Props {
  previewId: string;
  companyIds: string[];
}

export default function CompanyPreviewPanel({ previewId, companyIds }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");

  const currentIndex = companyIds.indexOf(previewId);
  const hasNext = currentIndex < companyIds.length - 1 && currentIndex !== -1;
  const hasPrev = currentIndex > 0;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    getCompanyDetailsAction(previewId).then(data => {
      if (mounted && data) {
        setCompany(data);
        setLoading(false);
        addRecentlyViewed({ id: data.id, name: data.businessName });
      }
    });
    
    return () => { mounted = false; };
  }, [previewId]);

  const closePanel = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("preview");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const navigateTo = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preview", id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ type: "success", message: `${label} copied` });
  };

  const handleTogglePin = async () => {
    if (!company) return;
    const newStatus = !company.isPinned;
    setCompany({ ...company, isPinned: newStatus });
    await updateCompanyAction(company.id, { isPinned: newStatus });
    toast({ type: "success", message: newStatus ? "Pinned" : "Unpinned" });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !company) return;
    
    const noteText = newNote;
    setNewNote("");
    
    // Optimistic UI
    const tempNote = { id: Date.now().toString(), content: noteText, createdAt: new Date() };
    setCompany((prev: any) => ({
      ...prev,
      timelineNotes: [tempNote, ...prev.timelineNotes]
    }));

    const actualNote = await createNoteAction(company.id, noteText);
    setCompany((prev: any) => ({
      ...prev,
      timelineNotes: prev.timelineNotes.map((n: any) => n.id === tempNote.id ? actualNote : n)
    }));
  };

  const handleDeleteNote = async (noteId: string) => {
    setCompany((prev: any) => ({
      ...prev,
      timelineNotes: prev.timelineNotes.filter((n: any) => n.id !== noteId)
    }));
    await deleteNoteAction(noteId);
  };

  if (loading || !company) {
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-[480px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => hasPrev && navigateTo(companyIds[currentIndex - 1])}
            disabled={!hasPrev}
            className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors rounded hover:bg-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-gray-400">
            {currentIndex + 1} of {companyIds.length}
          </span>
          <button
            onClick={() => hasNext && navigateTo(companyIds[currentIndex + 1])}
            disabled={!hasNext}
            className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors rounded hover:bg-gray-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePin}
            className={`p-1.5 rounded transition-colors ${company.isPinned ? "text-orange-500 bg-orange-50" : "text-gray-400 hover:text-gray-900 hover:bg-gray-200"}`}
            title={company.isPinned ? "Unpin" : "Pin"}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={closePanel}
            className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors rounded hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Main Info */}
        <div className="px-6 py-6 border-b border-gray-100 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{company.businessName}</h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {company.status}
              </span>
              {company.groups?.map((g: any) => (
                <span key={g.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  {g.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {company.city && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700">{company.city}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700">Created: {new Date(company.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Contact */}
        <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/30">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Contact & Links</h3>
          <div className="space-y-2">
            {company.email && (
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{company.email}</span>
                </div>
                <button onClick={() => copyToClipboard(company.email, "Email")} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-900 transition-all">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{company.phone}</span>
                </div>
                <button onClick={() => copyToClipboard(company.phone, "Phone")} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-900 transition-all">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {company.website && (
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {company.website}
                  </a>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => copyToClipboard(company.website, "Website")} className="p-1 text-gray-400 hover:text-gray-900">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-gray-900">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
            {company.instagram && (
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`https://instagram.com/${company.instagram}`} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-600 hover:underline">
                    @{company.instagram}
                  </a>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => copyToClipboard(company.instagram, "Instagram")} className="p-1 text-gray-400 hover:text-gray-900">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a href={`https://instagram.com/${company.instagram}`} target="_blank" rel="noopener noreferrer" className="p-1 text-gray-400 hover:text-gray-900">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
            {!company.email && !company.phone && !company.website && !company.instagram && (
              <p className="text-sm text-gray-400 italic">No contact details provided.</p>
            )}
          </div>
        </div>

        {/* Notes Timeline */}
        <div className="px-6 py-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Notes Timeline</h3>
          
          <form onSubmit={handleAddNote} className="mb-6 relative">
            <input
              type="text"
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-gray-50 focus:bg-white transition-all"
            />
            <button type="submit" disabled={!newNote.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-900 disabled:opacity-50 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {company.timelineNotes?.map((note: any) => (
              <div key={note.id} className="relative flex items-start gap-4 group">
                <div className="absolute left-0 w-4 h-4 rounded-full bg-gray-200 border-4 border-white mt-1 z-10" />
                <div className="pl-8 w-full">
                  <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(note.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!company.timelineNotes || company.timelineNotes.length === 0) && (
              <div className="text-center py-6 text-sm text-gray-400 italic">
                No notes yet. Add one above.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
