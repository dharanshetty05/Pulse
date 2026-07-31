"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, Clock, ThumbsUp, Star, FastForward,
  MapPin, Globe, Mail, Phone, Heart, Calendar,
  Building2, Trash2, Send, Copy, ExternalLink, ChevronLeft
} from "lucide-react";
import { getCompanyDetailsAction } from "@/app/actions/getCompany";
import { processSessionCompanyAction } from "@/app/actions/sessions";
import { createNoteAction, deleteNoteAction } from "@/app/actions/notes";
import { useToast } from "@/components/ui/toast";

interface Props {
  initialSession: any;
}

export default function SessionWorkspaceClient({ initialSession }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [session, setSession] = useState(initialSession);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [showFollowUpDate, setShowFollowUpDate] = useState(false);

  const currentCompanyId = session.currentCompanyId;
  const companies = session.companies || [];

  const completedCount = companies.filter((c: any) => c.state === "COMPLETED" || c.state === "SKIPPED").length;
  const totalCount = companies.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const isFinished = session.status === "COMPLETED" || currentCompanyId === null;

  useEffect(() => {
    let mounted = true;
    if (isFinished) return;
    if (!currentCompanyId) return;

    setLoading(true);
    getCompanyDetailsAction(currentCompanyId).then(data => {
      if (mounted && data) {
        setCompany(data);
        setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [currentCompanyId, isFinished]);

  const handleAction = async (actionType: "CONTACTED" | "FOLLOW_UP" | "INTERESTED" | "CLIENT" | "SKIP", followUpDate?: Date) => {
    if (!currentCompanyId || isProcessing || !company) return;
    setIsProcessing(true);

    // Optimistic UI updates
    const nextPending = companies.find((c: any) => c.companyId !== currentCompanyId && c.state === "PENDING" && c.queuePosition > (companies.find((x: any) => x.companyId === currentCompanyId)?.queuePosition || 0));

    const newState = actionType === "SKIP" ? "SKIPPED" : "COMPLETED";
    let statusUpdate = actionType === "SKIP" ? undefined : actionType;
    let noteContent = `Skipped in Focus Mode`;
    if (actionType !== "SKIP") {
      noteContent = `Status changed to ${actionType} in Focus Mode`;
    }

    // Update local session state
    const updatedCompanies = companies.map((c: any) => {
      if (c.companyId === currentCompanyId) {
        return { ...c, state: newState };
      }
      if (nextPending && c.companyId === nextPending.companyId) {
        return { ...c, state: "CURRENT" };
      }
      return c;
    });

    setSession({
      ...session,
      currentCompanyId: nextPending ? nextPending.companyId : null,
      status: nextPending ? "ACTIVE" : "COMPLETED",
      companies: updatedCompanies
    });

    // Fire background request
    try {
      await processSessionCompanyAction(
        session.id,
        currentCompanyId,
        newState,
        statusUpdate ? { status: statusUpdate as any, followUpDate } : undefined,
        noteContent
      );
    } catch (e) {
      toast({ type: "error", message: "Failed to save action" });
    } finally {
      setIsProcessing(false);
      setShowFollowUpDate(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ type: "success", message: `${label} copied` });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !company) return;
    const noteText = newNote;
    setNewNote("");

    const tempNote = { id: Date.now().toString(), content: noteText, createdAt: new Date() };
    setCompany((prev: any) => ({ ...prev, timelineNotes: [tempNote, ...prev.timelineNotes] }));

    const actualNote = await createNoteAction(company.id, noteText);
    setCompany((prev: any) => ({
      ...prev,
      timelineNotes: prev.timelineNotes.map((n: any) => n.id === tempNote.id ? actualNote : n)
    }));
  };

  if (isFinished) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center flex-col p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Queue Complete!</h2>
        <p className="text-gray-500 mb-8">You processed {completedCount} companies.</p>
        <button
          onClick={() => router.push("/companies")}
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-white text-sm">
      {/* Sidebar Queue */}
      <div className="w-72 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200 bg-white flex flex-col gap-3">
          <button onClick={() => router.push("/companies")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-900 mb-2">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 font-medium">
              <span>{completedCount} Done</span>
              <span>{totalCount - completedCount} Left</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {companies.map((sc: any) => {
            const isCurrent = sc.companyId === currentCompanyId;
            const isDone = sc.state === "COMPLETED" || sc.state === "SKIPPED";

            return (
              <div
                key={sc.id}
                className={`
                  px-4 py-2.5 flex items-center gap-3 transition-colors
                  ${isCurrent ? "bg-white border-y border-gray-200 shadow-sm relative z-10" : "opacity-70"}
                `}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${isCurrent ? "bg-blue-600" : isDone ? "bg-green-500" : "bg-gray-300"}`} />
                <span className={`truncate font-medium ${isCurrent ? "text-gray-900" : isDone ? "text-gray-400 line-through" : "text-gray-600"}`}>
                  {sc.company.businessName}
                </span>
                {sc.state === "SKIPPED" && <span className="text-[10px] font-bold uppercase text-gray-400 ml-auto bg-gray-200 px-1.5 py-0.5 rounded">Skip</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {loading || !company ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 animate-pulse">Loading company details...</div>
        ) : (
          <>
            {/* Header / Info */}
            <div className="px-8 py-8 border-b border-gray-100 shrink-0 bg-white flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{company.businessName}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                    {company.status}
                  </span>
                  {company.groups?.map((g: any) => (
                    <span key={g.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {g.name}
                    </span>
                  ))}
                </div>
                {company.city && (
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{company.city}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 min-w-[240px]">
                {company.email && (
                  <div className="flex items-center justify-between group bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 truncate pr-4">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">{company.email}</span>
                    </div>
                    <button onClick={() => copyToClipboard(company.email, "Email")} className="text-gray-400 hover:text-gray-900 shrink-0">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center justify-between group bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 truncate pr-4">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">{company.phone}</span>
                    </div>
                    <button onClick={() => copyToClipboard(company.phone, "Phone")} className="text-gray-400 hover:text-gray-900 shrink-0">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center justify-between group bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 truncate pr-4">
                      <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-blue-600 truncate">{company.website}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => copyToClipboard(company.website, "Website")} className="text-gray-400 hover:text-gray-900">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Notes & Activity</h3>

              <form onSubmit={handleAddNote} className="mb-8 relative">
                <input
                  type="text"
                  placeholder="Drop a quick note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 bg-white shadow-sm transition-all"
                />
                <button type="submit" disabled={!newNote.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {company.timelineNotes?.map((note: any) => (
                  <div key={note.id} className="relative flex items-start gap-4 group">
                    <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-gray-200 border-4 border-gray-50 mt-1.5 z-10" />
                    <div className="pl-8 md:pl-0 w-full flex md:justify-end md:odd:justify-start">
                      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm group-hover:shadow-md transition-shadow w-full md:w-[calc(50%-2rem)]">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            {new Date(note.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-8 py-5 border-t border-gray-200 bg-white shrink-0 flex items-center justify-between">
              <button
                onClick={() => handleAction("SKIP")}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                <FastForward className="w-4 h-4" />
                Skip
              </button>

              <div className="flex items-center gap-3 relative">
                <button
                  onClick={() => handleAction("CONTACTED")}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Check className="w-4 h-4" />
                  Contacted
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowFollowUpDate(!showFollowUpDate)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Clock className="w-4 h-4" />
                    Follow Up
                  </button>

                  <AnimatePresence>
                    {showFollowUpDate && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col z-50"
                      >
                        {[
                          { label: "Today", days: 0 },
                          { label: "Tomorrow", days: 1 },
                          { label: "In 3 Days", days: 3 },
                          { label: "Next Week", days: 7 },
                        ].map(opt => (
                          <button
                            key={opt.label}
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() + opt.days);
                              handleAction("FOLLOW_UP", d);
                            }}
                            className="px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 border-b border-gray-50 last:border-0 transition-colors"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => handleAction("INTERESTED")}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Interested
                </button>

                <button
                  onClick={() => handleAction("CLIENT")}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-500 transition-colors shadow-sm disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Star className="w-4 h-4" />
                  Client
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
