"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "undo";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  onUndo?: () => void;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((options: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toastMsg={t} onRemove={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toastMsg, onRemove }: { toastMsg: ToastMessage; onRemove: () => void }) {
  useEffect(() => {
    if (toastMsg.duration !== Infinity) {
      const timer = setTimeout(() => {
        onRemove();
      }, toastMsg.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        flex items-center justify-between gap-4 p-4 min-w-[300px] rounded-lg shadow-lg border text-sm
        ${toastMsg.type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
        ${toastMsg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
        ${toastMsg.type === "info" ? "bg-white border-gray-200 text-gray-800" : ""}
        ${toastMsg.type === "undo" ? "bg-gray-900 border-gray-800 text-white" : ""}
      `}
    >
      <span className="font-medium">{toastMsg.message}</span>
      <div className="flex items-center gap-2">
        {toastMsg.type === "undo" && toastMsg.onUndo && (
          <button
            onClick={() => {
              toastMsg.onUndo!();
              onRemove();
            }}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Undo
          </button>
        )}
        <button onClick={onRemove} className="opacity-70 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
