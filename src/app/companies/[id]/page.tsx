export const dynamic = "force-dynamic";

import { getCompanyById } from "@/lib/data/companies";
import CompanyDetails from "@/components/dashboard/CompanyDetails";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyById(id);

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-sm font-medium text-gray-900">Company not found</p>
        <p className="text-xs text-gray-400">This company may have been removed or the link is incorrect.</p>
        <Link
          href="/companies"
          className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/companies"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Companies
      </Link>

      <CompanyDetails company={company} />
    </div>
  );
}
