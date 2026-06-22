import { createLeadAction }
from "@/app/actions/createLead";

export default function NewLeadPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Add Lead
      </h1>

      <form action={createLeadAction}>
        <div className="space-y-4 max-w-xl">

          <input
            required
            name="businessName"
            placeholder="Business Name"
            className="w-full border p-3 rounded"
          />

          <input
            required
            name="city"
            placeholder="City"
            className="w-full border p-3 rounded"
          />

          <input
            required
            name="instagramId"
            placeholder="https://www.instagram.com/..."
            className="w-full border p-3 rounded"
          />

          <input
            name="website"
            placeholder="https://example.com"
            className="w-full border p-3 rounded"
          />

          <button
            className="border px-4 py-2 rounded"
          >
            Create Lead
          </button>

        </div>
      </form>
    </div>
  );
}