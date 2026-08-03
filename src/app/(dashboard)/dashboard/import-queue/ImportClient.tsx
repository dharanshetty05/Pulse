"use client";

import { useState, useRef, useEffect } from "react";
import { ImportCompany } from "@prisma/client";
import { parseCSV } from "@/lib/csv";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ArrowRight, Loader2, Trash2 } from "lucide-react";
import { uploadToQueueAction, approveSelectedAction, deleteImportItemAction } from "@/app/actions/importActions";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface Props {
  initialQueue: ImportCompany[];
}

export default function ImportClient({ initialQueue }: Props) {
  const [step, setStep] = useState<"list" | "map">("list");
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Mappings: Target Field -> CSV Header
  const [mappings, setMappings] = useState<Record<string, string>>({});
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  // Load previous mappings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("csvMappings");
    if (saved) {
      try { setMappings(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCSV(text);
      if (data.length > 0) {
        setParsedData(data);
        setHeaders(Object.keys(data[0]));
        setStep("map");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMapChange = (field: string, header: string) => {
    const newMappings = { ...mappings, [field]: header };
    setMappings(newMappings);
    localStorage.setItem("csvMappings", JSON.stringify(newMappings));
  };

  const confirmImport = async () => {
    if (!mappings.businessName) {
      toast({ type: "error", message: "Business Name mapping is required" });
      return;
    }
    
    setIsProcessing(true);
    const mappedRecords = parsedData.map(row => ({
      businessName: row[mappings.businessName],
      website: mappings.website ? row[mappings.website] : "",
      instagram: mappings.instagram ? row[mappings.instagram] : "",
      email: mappings.email ? row[mappings.email] : "",
      phone: mappings.phone ? row[mappings.phone] : "",
      city: mappings.city ? row[mappings.city] : "",
    })).filter(r => r.businessName);

    try {
      await uploadToQueueAction(mappedRecords);
      toast({ type: "success", message: `Added ${mappedRecords.length} companies to the queue` });
      setStep("list");
      setParsedData([]);
    } catch (e: any) {
      toast({ type: "error", message: e.message || "Failed to upload to queue" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Queue List logic
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "update" | "force">("skip");

  const toggleAll = () => {
    if (selectedIds.size === initialQueue.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(initialQueue.map(q => q.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleApprove = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    
    setIsProcessing(true);
    try {
      await approveSelectedAction(ids, duplicateStrategy);
      toast({ type: "success", message: `Approved ${ids.length} companies` });
      setSelectedIds(new Set());
    } catch (e: any) {
      toast({ type: "error", message: e.message || "Failed to approve companies" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    
    setIsProcessing(true);
    try {
      await Promise.all(ids.map(id => deleteImportItemAction(id)));
      toast({ type: "success", message: `Deleted ${ids.length} items from queue` });
      setSelectedIds(new Set());
    } catch (e: any) {
      toast({ type: "error", message: "Failed to delete items" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* View Switcher if not mapping */}
      {step === "list" && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-gray-900">Queue ({initialQueue.length})</h2>
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <span className="text-xs font-medium text-gray-500">Duplicate Strategy:</span>
              <select 
                value={duplicateStrategy}
                onChange={(e) => setDuplicateStrategy(e.target.value as any)}
                className="text-xs border border-gray-200 rounded px-2 py-1 outline-none"
              >
                <option value="skip">Skip</option>
                <option value="update">Update Existing</option>
                <option value="force">Import Anyway</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleDeleteSelected}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Delete Selected
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                  Approve Selected ({selectedIds.size})
                </button>
              </>
            )}
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload CSV
            </button>
            <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          </div>
        </div>
      )}
      
      {/* Step: List */}
      {step === "list" && (
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
          {initialQueue.length === 0 ? (
            <div className="py-20 text-center">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Queue is empty</p>
              <p className="text-xs text-gray-400 mt-1">Upload a CSV to start importing companies.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Browse Files
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={initialQueue.length > 0 && selectedIds.size === initialQueue.length}
                        onChange={toggleAll}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400 tracking-wider">Business Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400 tracking-wider">Website</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400 tracking-wider">City</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-400 tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {initialQueue.map(item => (
                    <tr key={item.id} className={`hover:bg-gray-50 ${selectedIds.has(item.id) ? "bg-gray-50" : ""}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleOne(item.id)}
                          className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.businessName}</td>
                      <td className="px-4 py-3 text-gray-500">{item.website || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{item.city || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={async () => {
                            await deleteImportItemAction(item.id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Step: Map */}
      {step === "map" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Map Columns</h2>
              <p className="text-sm text-gray-500">Match your CSV headers to Company fields.</p>
            </div>
            <button
              onClick={() => { setStep("list"); setParsedData([]); }}
              className="text-gray-400 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 max-w-2xl">
            {["businessName", "website", "instagram", "city", "email", "phone"].map(field => (
              <div key={field} className="flex items-center gap-4">
                <div className="w-1/3 text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                  {field === "businessName" && <span className="text-red-500 ml-1">*</span>}
                </div>
                <div className="w-10 text-center text-gray-400"><ArrowRight className="w-4 h-4 mx-auto" /></div>
                <div className="w-2/3">
                  <select
                    value={mappings[field] || ""}
                    onChange={(e) => handleMapChange(field, e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
                  >
                    <option value="">Ignore</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={() => { setStep("list"); setParsedData([]); }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={confirmImport}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Import {parsedData.length} rows to Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
