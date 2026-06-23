import { createLeadAction } from "@/app/actions/createLead";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Heart, Globe } from "lucide-react";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 shadow-sm outline-none transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100";

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
}

function Field({ label, icon, children, required }: FieldProps) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
          {icon}
        </div>
        <div className="[&>input]:pl-9">{children}</div>
      </div>
    </div>
  );
}

export default function NewLeadPage() {
  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Leads
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
          New Lead
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Add a Lead
        </h1>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Form card */}
      <form action={createLeadAction}>
        <div className="max-w-lg space-y-5">

          <Field label="Business Name" icon={<Building2 className="h-4 w-4" strokeWidth={1.5} />} required>
            <input
              required
              name="businessName"
              placeholder="e.g. Blue Bottle Coffee"
              className={inputClass}
              autoComplete="off"
            />
          </Field>

          <Field label="City" icon={<MapPin className="h-4 w-4" strokeWidth={1.5} />} required>
            <input
              required
              name="city"
              placeholder="e.g. Bangalore"
              className={inputClass}
              autoComplete="off"
            />
          </Field>

          <Field label="Instagram" icon={<Heart className="h-4 w-4" strokeWidth={1.5} />} required>
            <input
              required
              name="instagramId"
              placeholder="https://www.instagram.com/…"
              className={inputClass}
              type="url"
              autoComplete="off"
            />
          </Field>

          <Field label="Website" icon={<Globe className="h-4 w-4" strokeWidth={1.5} />}>
            <input
              name="website"
              placeholder="https://example.com"
              className={inputClass}
              type="url"
              autoComplete="off"
            />
          </Field>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Create Lead
            </button>
            <Link
              href="/leads"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}