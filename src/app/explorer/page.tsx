"use client";

import { useState, useMemo } from "react";
import schemesData from "@root/data/schemes.json";
import type { Scheme } from "@root/types/index";

const schemes = schemesData as Scheme[];

// ─── Category config ──────────────────────────────────────────────────────────
type Category = "all" | Scheme["category"];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all",            label: "All" },
  { value: "student",        label: "Student" },
  { value: "farmer",         label: "Farmer" },
  { value: "senior_citizen", label: "Senior Citizen" },
  { value: "women",          label: "Women" },
  { value: "healthcare",     label: "Healthcare" },
  { value: "general",        label: "General" },
];

const CATEGORY_COLORS: Record<string, string> = {
  student:        "bg-[#eaf3fe] text-[#2563b0]",
  farmer:         "bg-[#e8f5e9] text-[#2b5a3f]",
  senior_citizen: "bg-[#fdf3e3] text-[#a0580c]",
  women:          "bg-[#fce8f3] text-[#9b2671]",
  healthcare:     "bg-[#ece8fd] text-[#5b3ecb]",
  general:        "bg-[#f1f3f5] text-[#495057]",
};

const CATEGORY_LABELS: Record<string, string> = {
  student:        "Student",
  farmer:         "Farmer",
  senior_citizen: "Senior Citizen",
  women:          "Women",
  healthcare:     "Healthcare",
  general:        "General",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExplorerPage() {
  const [search, setSearch]           = useState("");
  const [activeCategory, setCategory] = useState<Category>("all");
  const [expandedId, setExpandedId]   = useState<string | null>(null);

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return schemes.filter((s) => {
      const matchesCategory = activeCategory === "all" || s.category === activeCategory;
      const matchesSearch   = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8] pt-10 pb-24 px-5">
      <div className="max-w-[960px] mx-auto">

        {/* ── Page Header ── */}
        <div className="text-center mb-10">
          <h1 className="text-[32px] sm:text-[38px] font-bold text-gray-900 leading-tight mb-2">
            Scheme Explorer
          </h1>
          <p className="text-[16px] text-gray-500">
            Browse government schemes by category
          </p>
        </div>

        {/* ── Search Bar ── */}
        <div className="relative mb-5">
          <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            id="scheme-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes..."
            className="w-full pl-12 pr-5 py-4 text-[15px] text-gray-800 bg-white border border-[#e8ecea] rounded-[20px] shadow-[0_1px_3px_rgba(31,42,36,0.05)] outline-none focus:border-[#2b5a3f] focus:ring-2 focus:ring-[#2b5a3f]/10 transition-all placeholder:text-gray-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Category Pills ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-all border ${
                activeCategory === cat.value
                  ? "bg-[#2b5a3f] text-white border-[#2b5a3f] shadow-sm"
                  : "bg-white text-gray-600 border-[#e0e5e2] hover:border-[#2b5a3f] hover:text-[#2b5a3f]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Result count ── */}
        <div className="text-[12px] font-bold tracking-[2px] uppercase text-gray-400 mb-5">
          {filtered.length === 0
            ? "No schemes found"
            : `${filtered.length} scheme${filtered.length === 1 ? "" : "s"}`}
        </div>

        {/* ── Zero results ── */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-[20px] p-10 text-center shadow-[0_1px_3px_rgba(31,42,36,0.05)]">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-[16px] font-semibold text-gray-800 mb-1">No schemes found</p>
            <p className="text-[14px] text-gray-400 leading-relaxed">
              Try a different search term or select another category.
            </p>
          </div>
        )}

        {/* ── Scheme Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((scheme) => {
            const isExpanded = expandedId === scheme.id;
            return (
              <div
                key={scheme.id}
                className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(31,42,36,0.05),0_1px_2px_rgba(31,42,36,0.04)] border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Card top */}
                <div className="p-6">
                  {/* Category badge */}
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 ${CATEGORY_COLORS[scheme.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {CATEGORY_LABELS[scheme.category] ?? scheme.category}
                  </span>

                  {/* Name */}
                  <h2 className="text-[16px] font-bold text-gray-900 leading-snug mb-2">
                    {scheme.name}
                  </h2>

                  {/* Description */}
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
                    {scheme.description}
                  </p>

                  {/* View details toggle */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(scheme.id)}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2b5a3f] hover:text-[#224732] transition-colors"
                  >
                    {isExpanded ? "Hide details" : "View details"}
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M2.5 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Expandable details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-[#f7f9f8] px-6 py-5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Eligibility summary */}
                    <div className="mb-4">
                      <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-2">
                        Eligibility
                      </div>
                      <div className="flex flex-wrap gap-2 text-[12px] text-gray-600">
                        {scheme.eligibility.minAge !== null && (
                          <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                            Age ≥ {scheme.eligibility.minAge}
                          </span>
                        )}
                        {scheme.eligibility.maxAge !== null && (
                          <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                            Age ≤ {scheme.eligibility.maxAge}
                          </span>
                        )}
                        {scheme.eligibility.maxIncome !== null && (
                          <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                            Income ≤ ₹{(scheme.eligibility.maxIncome / 100000).toFixed(1)}L
                          </span>
                        )}
                        {scheme.eligibility.states[0] !== "all" && (
                          <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                            {scheme.eligibility.states.join(", ")}
                          </span>
                        )}
                        {(scheme.eligibility.minAge === null &&
                          scheme.eligibility.maxAge === null &&
                          scheme.eligibility.maxIncome === null &&
                          scheme.eligibility.states[0] === "all") && (
                          <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-full">
                            Open to all Indian citizens
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Documents needed */}
                    <div>
                      <div className="text-[11px] font-bold tracking-[1.5px] uppercase text-gray-400 mb-2">
                        Documents needed
                      </div>
                      <ul className="space-y-1.5">
                        {scheme.documentsNeeded.map((doc, i) => (
                          <li key={i} className="flex items-center gap-2 text-[13px] text-gray-700">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-[#2b5a3f]">
                              <rect x="0.5" y="0.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1" />
                            </svg>
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
