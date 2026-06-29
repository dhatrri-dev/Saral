"use client";

import { useState } from "react";
import type { MatchedScheme } from "@root/types/index";
import { supabase } from "@root/lib/supabase";
import { Save, Check, Loader2 } from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar Islands", "Chandigarh", "Delhi", "Jammu & Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

const INCOME_BANDS = [
  { value: "under_1l",    label: "Below ₹1 lakh" },
  { value: "1l_2l",       label: "₹1–2 lakh" },
  { value: "2l_2_5l",     label: "₹2–2.5 lakh" },
  { value: "2_5l_5l",     label: "₹2.5–5 lakh" },
  { value: "5l_8l",       label: "₹5–8 lakh" },
  { value: "above_8l",    label: "Above ₹8 lakh" },
];

const OCCUPATIONS = [
  { value: "student",    label: "Student" },
  { value: "farmer",     label: "Farmer" },
  { value: "employed",   label: "Employed (Salaried / Business)" },
  { value: "unemployed", label: "Unemployed / Job-seeking" },
  { value: "retired",    label: "Retired" },
  { value: "other",      label: "Other" },
];

const GENDERS = [
  { value: "male",   label: "Male" },
  { value: "female", label: "Female" },
  { value: "other",  label: "Other" },
];

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "obc",     label: "OBC" },
  { value: "sc",      label: "SC" },
  { value: "st",      label: "ST" },
  { value: "ews",     label: "EWS" },
];

const EDUCATION_LEVELS = [
  { value: "school",        label: "School (10th / 12th)" },
  { value: "diploma",       label: "Diploma / ITI" },
  { value: "undergraduate", label: "Undergraduate (UG)" },
  { value: "postgraduate",  label: "Postgraduate (PG)" },
];

const COURSES = [
  { value: "engineering", label: "Engineering / Technology" },
  { value: "medicine",    label: "Medicine / Healthcare" },
  { value: "arts",        label: "Arts / Humanities" },
  { value: "commerce",    label: "Commerce / Management" },
  { value: "science",     label: "Science" },
  { value: "other",       label: "Other" },
];

const CATEGORY_LABELS: Record<string, string> = {
  student:        "Student",
  farmer:         "Farmer",
  senior_citizen: "Senior Citizen",
  women:          "Women",
  healthcare:     "Healthcare",
  general:        "General",
};

const CATEGORY_COLORS: Record<string, string> = {
  student:        "bg-[#eaf3fe] text-[#2563b0]",
  farmer:         "bg-[#e8f5e9] text-[#2b5a3f]",
  senior_citizen: "bg-[#fdf3e3] text-[#a0580c]",
  women:          "bg-[#fce8f3] text-[#9b2671]",
  healthcare:     "bg-[#ece8fd] text-[#5b3ecb]",
  general:        "bg-[#f1f3f5] text-[#495057]",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ChevronIcon = () => (
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────────
export default function MatcherPage() {
  const [state, setState]           = useState("");
  const [age, setAge]               = useState("");
  const [gender, setGender]         = useState("");
  const [category, setCategory]     = useState("");
  const [occupation, setOccupation] = useState("");
  const [incomeBand, setIncomeBand] = useState("");
  // Student-specific fields
  const [educationLevel, setEducationLevel] = useState("");
  const [course, setCourse]                 = useState("");

  const [matches, setMatches]       = useState<MatchedScheme[] | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Save states
  const [savingProfile, setSavingProfile]       = useState(false);
  const [profileSaved, setProfileSaved]         = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  const handleFind = async () => {
    if (!age || !occupation || !incomeBand) {
      setError("Please fill in Age, Occupation, and Annual Family Income to continue.");
      return;
    }
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setError("Please enter a valid age.");
      return;
    }
    setError("");
    setLoading(true);
    setHasSearched(false);
    setProfileSaved(false);
    setProfileSaveError(null);

    await new Promise((r) => setTimeout(r, 500));

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parsedAge, incomeBand, occupation, state,
          gender, category, educationLevel, course
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setMatches(null);
      } else {
        setMatches(data.matches);
        setHasSearched(true);
      }
    } catch {
      setError("Could not connect to the server. Please check your connection.");
      setMatches(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!matches) return;
    setSavingProfile(true);
    setProfileSaveError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setProfileSaveError("You must be logged in to save.");
        setSavingProfile(false);
        return;
      }

      const profile = { state, age, gender, category, occupation, incomeBand, educationLevel, course };
      const matched_scheme_ids = matches.map((m) => m.id);

      const { error } = await supabase.from('eligibility_matches').insert({
        user_id: session.user.id,
        profile: profile,
        matched_scheme_ids: matched_scheme_ids,
      });

      if (error) throw error;
      setProfileSaved(true);
    } catch (e: any) {
      setProfileSaveError(e.message || "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3.5 text-[15px] text-gray-800 bg-white border border-[#e0e5e2] rounded-[12px] outline-none focus:border-[#2b5a3f] focus:ring-2 focus:ring-[#2b5a3f]/10 transition-all appearance-none";
  const labelBase = "block text-[13px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-[#f7f9f8] pt-10 pb-24 px-5">
      <div className="max-w-[860px] mx-auto">

        {/* ── Page Header ── */}
        <div className="text-center mb-10">
          <h1 className="text-[32px] sm:text-[38px] font-bold text-gray-900 leading-tight mb-2">
            Find schemes you qualify for
          </h1>
          <p className="text-[16px] text-gray-500">
            Answer a few questions, no document needed
          </p>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-[20px] p-7 sm:p-9 shadow-[0_1px_3px_rgba(31,42,36,0.05)] mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-7">

            {/* State */}
            <div>
              <label htmlFor="state-input" className={labelBase}>State</label>
              <div className="relative">
                <select
                  id="state-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={`${inputBase} pr-10 cursor-pointer`}
                >
                  <option value="">All states</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age-input" className={labelBase}>Age</label>
              <input
                id="age-input"
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => { setAge(e.target.value); setError(""); }}
                placeholder="e.g. 24"
                className={inputBase}
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender-input" className={labelBase}>Gender</label>
              <div className="relative">
                <select
                  id="gender-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`${inputBase} pr-10 cursor-pointer`}
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category-input" className={labelBase}>Category</label>
              <div className="relative">
                <select
                  id="category-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${inputBase} pr-10 cursor-pointer`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            {/* Occupation */}
            <div>
              <label htmlFor="occupation-input" className={labelBase}>Occupation</label>
              <div className="relative">
                <select
                  id="occupation-input"
                  value={occupation}
                  onChange={(e) => { setOccupation(e.target.value); setError(""); setEducationLevel(""); setCourse(""); }}
                  className={`${inputBase} pr-10 cursor-pointer`}
                >
                  <option value="">Select occupation</option>
                  {OCCUPATIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            {/* Annual Family Income */}
            <div>
              <label htmlFor="income-input" className={labelBase}>Annual Family Income</label>
              <div className="relative">
                <select
                  id="income-input"
                  value={incomeBand}
                  onChange={(e) => { setIncomeBand(e.target.value); setError(""); }}
                  className={`${inputBase} pr-10 cursor-pointer`}
                >
                  <option value="">Select income range</option>
                  {INCOME_BANDS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            {/* Student-specific: Education Level + Course */}
            {occupation === "student" && (
              <>
                <div>
                  <label htmlFor="education-input" className={labelBase}>Education Level</label>
                  <div className="relative">
                    <select
                      id="education-input"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className={`${inputBase} pr-10 cursor-pointer`}
                    >
                      <option value="">Select level</option>
                      {EDUCATION_LEVELS.map((e) => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                    <ChevronIcon />
                  </div>
                </div>

                <div>
                  <label htmlFor="course-input" className={labelBase}>Course / Stream</label>
                  <div className="relative">
                    <select
                      id="course-input"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className={`${inputBase} pr-10 cursor-pointer`}
                    >
                      <option value="">Select course</option>
                      {COURSES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <ChevronIcon />
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Validation error */}
          {error && (
            <div className="flex items-center gap-2 text-[#d64c4c] text-[13px] font-medium mb-5 animate-in fade-in slide-in-from-top-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#d64c4c" strokeWidth="1.5" />
                <path d="M7 4.5V7.5" stroke="#d64c4c" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="9.5" r="0.75" fill="#d64c4c" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="button"
            id="find-schemes-btn"
            onClick={handleFind}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#2b5a3f] text-white text-[16px] font-semibold rounded-[14px] hover:bg-[#224732] transition-colors disabled:opacity-80 disabled:cursor-wait"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Finding schemes...
              </>
            ) : (
              <>
                <span className="text-white/70 text-[14px]">☐</span>
                Find my schemes
              </>
            )}
          </button>
        </div>

        {/* ── Results ── */}
        {hasSearched && matches !== null && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">

            {/* Count header and Save Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
              <div className="text-[12px] font-bold tracking-[2px] uppercase text-gray-500">
                {matches.length === 0
                  ? "No schemes matched"
                  : `${matches.length} scheme${matches.length === 1 ? "" : "s"} matched`}
              </div>

              {matches.length > 0 && (
                <div className="flex flex-col items-end">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile || profileSaved}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors shadow-sm ${
                      profileSaved
                        ? "bg-[#e8f5e9] text-[#2b5a3f] border border-[#c5deca]"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {savingProfile ? (
                      <Loader2 size={15} className="animate-spin text-gray-400" />
                    ) : profileSaved ? (
                      <Check size={15} className="text-[#2b5a3f]" />
                    ) : (
                      <Save size={15} className="text-gray-500" />
                    )}
                    {profileSaved ? "Saved to Dashboard" : "Save Profile & Matches"}
                  </button>
                  {profileSaveError && (
                    <div className="text-[11px] text-[#d64c4c] mt-1 font-medium">
                      {profileSaveError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Zero results */}
            {matches.length === 0 && (
              <div className="bg-white rounded-[20px] p-8 text-center shadow-[0_1px_3px_rgba(31,42,36,0.05)]">
                <div className="text-3xl mb-3">🔍</div>
                <p className="text-[16px] font-semibold text-gray-800 mb-1">No exact matches found</p>
                <p className="text-[14px] text-gray-500 leading-relaxed max-w-[360px] mx-auto">
                  Try adjusting your details — for example, a different income range or occupation —
                  or browse all schemes in the Scheme Explorer.
                </p>
              </div>
            )}

            {/* Matched scheme cards */}
            <div className="flex flex-col gap-4">
              {matches.map((scheme) => (
                <div
                  key={scheme.id}
                  className="bg-white rounded-[20px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(31,42,36,0.05)] border border-gray-100 transition-shadow hover:shadow-md"
                >
                  {/* Top row: name + category badge */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h2 className="text-[17px] font-bold text-gray-900 leading-snug">
                      {scheme.name}
                    </h2>
                    <span
                      className={`shrink-0 text-[12px] font-semibold px-3 py-1 rounded-full ${CATEGORY_COLORS[scheme.category] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {CATEGORY_LABELS[scheme.category] ?? scheme.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[14px] text-gray-500 leading-relaxed mb-3">
                    {scheme.description}
                  </p>

                  {/* Reason line */}
                  <div className="flex items-center gap-2 text-[13px] text-[#2b5a3f] font-medium">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0 mt-px">
                      <rect x="0.5" y="0.5" width="12" height="12" rx="2.5" stroke="#2b5a3f" strokeWidth="1" />
                    </svg>
                    {scheme.reason}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
