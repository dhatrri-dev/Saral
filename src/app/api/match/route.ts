import { NextResponse } from "next/server";
import schemesData from "@root/data/schemes.json";
import type { Scheme, MatchedScheme } from "@root/types/index";

const schemes = schemesData as Scheme[];

// ─── Income band upper bounds in INR ──────────────────────────────────────────
const INCOME_BAND_MAP: Record<string, number> = {
  "under_1l":   100_000,
  "1l_2l":      200_000,
  "2l_2_5l":    250_000,
  "2_5l_5l":    500_000,
  "5l_8l":      800_000,
  "above_8l":   Infinity,
};

// ─── Occupation → scheme occupation keywords ──────────────────────────────────
const OCCUPATION_MATCH: Record<string, string[]> = {
  student:    ["student"],
  farmer:     ["farmer"],
  employed:   ["any", "employed"],
  unemployed: ["any", "unemployed"],
  retired:    ["any"],
  other:      ["any"],
};

function buildReason(
  scheme: Scheme,
  matchedFields: string[],
  isPotentiallyEligible: boolean
): string {
  if (isPotentiallyEligible) return "Potentially Eligible – More Information Required";
  if (matchedFields.length === 0) return "Open to all eligible Indian citizens";
  const joined =
    matchedFields.length === 1
      ? matchedFields[0]
      : matchedFields.slice(0, -1).join(", ") + " and " + matchedFields[matchedFields.length - 1];
  return `Likely eligible — matched on ${joined}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      age,
      incomeBand,
      occupation,
      state,
      gender,
      category,
      educationLevel,
      course,
    } = body as {
      age: number;
      incomeBand: string;
      occupation: string;
      state: string;
      gender?: string;
      category?: string;
      educationLevel?: string;
      course?: string;
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
      const matchedFields: string[] = [];

      // ── HARD FILTER: Age ──────────────────────────────────────────────────
      if (el.minAge !== null && age < el.minAge) continue;
      if (el.maxAge !== null && age > el.maxAge) continue;

      // ── HARD FILTER: Income ───────────────────────────────────────────────
      if (el.maxIncome !== null && incomeUpperBound > el.maxIncome) continue;

      // ── HARD FILTER: Occupation ───────────────────────────────────────────
      if (el.occupation !== null && el.occupation.length > 0) {
        const schemeOccupations = el.occupation.map((o) => o.toLowerCase());
        const hasAny = schemeOccupations.includes("any");
        const exactMatch = validOccupations.some((v) => schemeOccupations.includes(v));
        if (!hasAny && !exactMatch) continue;
        if (exactMatch && !hasAny) {
          score += 3;
          matchedFields.push("your occupation");
        }
      }

      // ── HARD FILTER: State ────────────────────────────────────────────────
      if (!el.states.includes("all")) {
        const schemeStates = el.states.map((s) => s.toLowerCase());
        if (
          !normalizedState ||
          !schemeStates.some((s) => s.includes(normalizedState) || normalizedState.includes(s))
        ) {
          continue;
        }
        score += 2;
        matchedFields.push("your state");
      }

      // ── HARD FILTER: Gender ───────────────────────────────────────────────
      // If scheme requires a specific gender, user must match
      if (el.gender !== null && el.gender !== undefined) {
        if (!gender || gender !== el.gender) continue;
        score += 2;
        matchedFields.push("your gender");
      }

      // ── HARD FILTER: Caste / Social Category ─────────────────────────────
      // If scheme requires specific categories (SC/ST/OBC etc.), user must be one
      if (el.categories !== null && el.categories !== undefined && el.categories.length > 0) {
        if (!category) continue;
        const schemeCats = el.categories.map((c) => c.toLowerCase());
        if (!schemeCats.includes(category.toLowerCase())) continue;
        score += 3;
        matchedFields.push("your category");
      }

      // ── HARD FILTER: Education Level ──────────────────────────────────────
      if (el.educationLevel && el.educationLevel.length > 0) {
        if (!educationLevel) continue;
        const schemeEdu = el.educationLevel.map((e) => e.toLowerCase());
        if (!schemeEdu.includes(educationLevel.toLowerCase())) continue;
        score += 2;
        matchedFields.push("your education level");
      }

      // ── HARD FILTER: Course ───────────────────────────────────────────────
      if (el.course && el.course.length > 0) {
        if (!course) continue;
        const schemeCourse = el.course.map((c) => c.toLowerCase());
        if (!schemeCourse.includes(course.toLowerCase())) continue;
        score += 2;
        matchedFields.push("your course");
      }

      let isPotentiallyEligible = false;

      // ── HARD FILTER: Special Conditions ───────────────────────────────────
      // If scheme has special conditions (pregnant, tb_patient, disabled, bpl,
      // violence_victim, award_nomination, child_under_2, landholding_farmer)
      if (
        el.specialConditions !== null &&
        el.specialConditions !== undefined &&
        el.specialConditions.length > 0
      ) {
        let shouldSkip = false;
        for (const cond of el.specialConditions) {
          if (cond === "potential_info_needed") {
            isPotentiallyEligible = true;
          } else {
            shouldSkip = true;
          }
        }
        if (shouldSkip) continue;
      }

      // ── Relevance scoring: age ────────────────────────────────────────────
      if (el.minAge !== null || el.maxAge !== null) {
        matchedFields.push("your age");
      }
      if (el.maxIncome !== null) {
        score += 1;
        matchedFields.push("your income");
      }

      const reason = buildReason(scheme, matchedFields, isPotentiallyEligible);
      matches.push({ ...scheme, reason, relevanceScore: score });
    }

    // Sort: highest relevance score first, then alphabetically
    matches.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
      return a.name.localeCompare(b.name);
    });

    console.log(
      `[Saral /api/match] age=${age}, income=${incomeBand}, occ=${occupation}, state=${state || "any"}, gender=${gender || "any"}, cat=${category || "any"} → ${matches.length} match(es)`
    );

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Unexpected error in /api/match:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
