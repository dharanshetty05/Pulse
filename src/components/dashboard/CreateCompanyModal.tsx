"use client";

import { useActionState, useEffect, useState } from "react";
import { createCompanyAction } from "@/app/actions/createCompany";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const initialState = {
  error: "",
};

export default function CreateCompanyModal({ isOpen, onClose }: Props) {
  const [state, formAction, isPending] = useActionState(createCompanyAction, initialState);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">New Company</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form action={formAction} className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-colors"
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-colors"
                  placeholder="acme.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagramId"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-colors"
                  placeholder="@acmecorp"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-colors"
                placeholder="San Francisco"
              />
            </div>

            {state?.error && (
              <p className="text-xs text-red-500 font-medium">{state.error}</p>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create Company
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
