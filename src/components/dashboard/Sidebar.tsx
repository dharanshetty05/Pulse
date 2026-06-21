import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">
        Outreach OS
      </h1>

      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Dashboard
        </Link>

        <Link
          href="/leads"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Leads
        </Link>

        <Link
          href="/followups"
          className="block rounded-lg px-4 py-3 hover:bg-gray-100"
        >
          Follow Ups
        </Link>
      </nav>
    </aside>
  );
}