"use client";

import { useState } from "react";
import CreateCompanyModal from "./CreateCompanyModal";
import { Plus } from "lucide-react";

export default function NewCompanyButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 transition-colors"
      >
        <Plus className="h-4 w-4" />
        New Company
      </button>

      <CreateCompanyModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
