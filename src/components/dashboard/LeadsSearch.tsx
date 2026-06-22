"use client";

import { useMemo, useState } from "react";

import { Lead } from "@/types/lead";
import LeadsTable from "./LeadsTable";
import {
  parseLeadDate,
  isToday,
  isThisWeek,
  isThisMonth,
} from "@/lib/date";

interface Props {
  leads: Lead[];
}

export default function LeadsSearch({
  leads,
}: Props) {
    const [query, setQuery] = useState("");
    const [city, setCity] = useState("All");
    const [filter, setFilter] = useState("week");

const filteredLeads = useMemo(() => {
  return leads.filter((lead) => {
    const matchesSearch =
      lead.businessName
        .toLowerCase()
        .includes(query.toLowerCase());

    const leadDate =
      parseLeadDate(
        lead.dateContacted
      );

    let matchesDate = true;

    if (filter === "today") {
      matchesDate =
        isToday(leadDate);
    }

    if (filter === "week") {
      matchesDate =
        isThisWeek(leadDate);
    }

    if (filter === "month") {
      matchesDate =
        isThisMonth(leadDate);
    }

    return (
      matchesSearch &&
      matchesDate
    );
  });
}, [leads, query, filter]);

    const cities = [
        "All",
        ...new Set(
            leads.map((lead) => lead.city)
        ),
    ];

  return (
    <div className="space-y-4">

      <div className="flex gap-2">
  <button
    onClick={() => setFilter("today")}
  >
    Today
  </button>

  <button
    onClick={() => setFilter("week")}
  >
    This Week
  </button>

  <button
    onClick={() => setFilter("month")}
  >
    This Month
  </button>

  <button
    onClick={() => setFilter("all")}
  >
    All
  </button>
</div>

      <input
        type="text"
        placeholder="Search business..."
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
        className="w-full rounded-xl border p-3"
      />

        <select
            value={city}
            onChange={(e) =>
                setCity(e.target.value)
            }
            className="rounded-xl border p-3"
            >
            {cities.map((city) => (
                <option
                key={city}
                value={city}
                >
                {city}
                </option>
            ))}
        </select>

      <LeadsTable leads={filteredLeads} />
    </div>
  );
}