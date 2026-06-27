import { NextResponse } from "next/server";
import schemesData from "@root/data/schemes.json";
import type { Scheme, MatchedScheme } from "@root/types/index";

const schemes = schemesData as Scheme[];

// Income band upper bounds in INR
const INCOME_BAND_MAP: Record<string, number> = {
  "under_1l":   100000,
  "1l_2_5l":    250000,
  "2_5l_5l":    500000,
  "above_5l":   Infinity,
};

// Occupation mapping — what user occupations match scheme occupation lists
const OCCUPATION_MATCH: Record<string, string[]> = {
  student:    ["student"],
  farmer:     ["farmer"],
  employed:   ["any", "employed"],
  unemployed: ["any", "unemployed"],
  retired:    ["any"],
  other:      ["any"],
};

function buildReason(scheme: Scheme, age: number, incomeBand: string, occupation: string, state: string): string {
  const reasons: string[] = [];

  const hasAgeMatch = (scheme.eligibility.minAge !== null || scheme.eligibility.maxAge !== null);
  const hasIncomeMatch = scheme.eligibility.maxIncome !== null;
  const hasOccupationMatch = scheme.eligibility.occupation && !scheme.eligibility.occupation.includes("any");
  const hasStateMatch = !scheme.eligibility.states.includes("all");

  if (hasAgeMatch) reasons.push("your age");
  if (hasIncomeMatch) reasons.push("your income");
  if (hasOccupationMatch) reasons.push("your occupation");
  if (hasStateMatch) reasons.push("your state");

  if (reasons.length === 0) return "Open to all eligible Indian citizens";

  const joined = reasons.length === 1
    ? reasons[0]
    : reasons.slice(0, -1).join(", ") + " and " + reasons[reasons.length - 1];

  return `Likely eligible — ${joined} fit${reasons.length === 1 ? "s" : ""} this scheme's requirements`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { age, incomeBand, occupation, state } = body as {
      age: number;
      incomeBand: string;
      occupation: string;
      state: string;
    };

    if (!age || !incomeBand || !occupation) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const incomeUpperBound = INCOME_BAND_MAP[incomeBand] ?? Infinity;
    const validOccupations = OCCUPATION_MATCH[occupation] ?? ["any"];
    const normalizedState = state?.trim().toLowerCase() ?? "";

    const matches: MatchedScheme[] = [];

    for (const scheme of schemes) {
      const el = scheme.eligibility;
      let score = 0;

      // ── Age check ──────────────────────────────────────────────────────────
      if (el.minAge !== null && age < el.minAge) continue;
      if (el.maxAge !== null && age > el.maxAge) continue;

      // ── Income check ───────────────────────────────────────────────────────
      if (el.maxIncome !== null && incomeUpperBound > el.maxIncome) continue;

      // ── Occupation check ───────────────────────────────────────────────────
      if (el.occupation !== null && el.occupation.length > 0) {
        const schemeOccupations = el.occupation.map((o) => o.toLowerCase());
        const hasAny = schemeOccupations.includes("any");
        const exactMatch = validOccupations.some((v) => schemeOccupations.includes(v));
        if (!hasAny && !exactMatch) continue;
        if (exactMatch && !hasAny) score += 3; // exact occupation match → higher relevance
      }

      // ── State check ────────────────────────────────────────────────────────
      if (!el.states.includes("all")) {
        const schemeStates = el.states.map((s) => s.toLowerCase());
        if (!normalizedState || !schemeStates.some((s) => s.includes(normalizedState) || normalizedState.includes(s))) {
          continue;
        }
        score += 2; // state-specific and user's state matches
      }

      // ── Build reason line ──────────────────────────────────────────────────
      const reason = buildReason(scheme, age, incomeBand, occupation, state);

      matches.push({ ...scheme, reason, relevanceScore: score });
    }

    // Sort: highest relevance score first, then alphabetically
    matches.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
      return a.name.localeCompare(b.name);
    });

    console.log(
      `[Saral /api/match] age=${age}, income=${incomeBand}, occupation=${occupation}, state=${state || "any"} → ${matches.length} match(es)`
    );

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Unexpected error in /api/match:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
