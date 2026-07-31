"use client";

import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { discardSessionAction } from "@/app/actions/sessions";

interface Props {
  sessionId: string;
}

export default function SessionBanner({ sessionId }: Props) {
  const router = useRouter();

  const handleDiscard = async () => {
    if (confirm("Are you sure you want to discard this session?")) {
      await discardSessionAction(sessionId);
    }
  };

  const handleResume = () => {
    router.push(`/session/${sessionId}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Active Outreach Session Available</h3>
          <p className="text-xs text-blue-700">You have an unfinished session waiting for you.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleResume}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors shadow-sm"
        >
          Resume Session
        </button>
        <button 
          onClick={handleDiscard}
          className="p-1.5 text-blue-400 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors"
          title="Discard Session"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
