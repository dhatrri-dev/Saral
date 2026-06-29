import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SimplifyResult } from "@root/types/index";

// ─── Demo Mode (only active when DEMO_MODE=true env var is set) ───────────────
const DEMO_MODE = process.env.DEMO_MODE === "true";

function mockResponse(): SimplifyResult {
  return {
    summary:
      "[DEMO MODE] This is a simulated response. In production, this section contains a plain-language summary of your actual document.",
    eligibility:
      "[DEMO MODE] This is placeholder eligibility information. The real AI extracts this directly from your document.",
    documentsNeeded: ["[DEMO] Proof of Identity", "[DEMO] Address Proof"],
    nextSteps: [
      {
        title: "[DEMO] This is a demo step",
        detail: "In production, each step is extracted from your actual document with clear, actionable guidance.",
      },
    ],
    redFlags: ["[DEMO] This is placeholder data — not from your real document."],
  };
}

// ─── Shared system prompt ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a plain-language explainer for confusing official and government documents. Your audience is ordinary citizens who may have no background knowledge of legal or bureaucratic terminology.

Your task: Read the document provided and return ONLY valid JSON (no markdown, no code fences, no preamble, no explanation outside the JSON) in exactly this shape:

{
  "summary": "3-4 sentence plain-language explanation of what this document is about, written for someone with no background knowledge. No jargon. Be warm and clear.",
  "eligibility": "A direct, plain-language statement of whether the reader is likely eligible based on common criteria mentioned in the document, with brief reasoning. If the document doesn't contain enough info to judge eligibility, say so clearly instead of guessing.",
  "documentsNeeded": ["list", "of", "documents", "needed", "as short strings"],
  "nextSteps": [
    {
      "title": "Short title of the step (e.g. 'Get your income certificate')",
      "detail": "Longer explanation of the step (e.g. 'Issued by your local tehsildar or revenue office — valid for 12 months')"
    }
  ],
  "redFlags": ["list", "of", "hidden fees, unfair clauses, extreme deadlines, or suspicious requirements. Leave empty if none exist."]
}

Rules:
- ONLY output the JSON object. Nothing else.
- Keep the summary accessible — imagine explaining to a family member who doesn't read official documents.
- For eligibility, be honest about uncertainty. If the document is a general notice with no eligibility criteria, say "This document applies to everyone" or similar.
- For documentsNeeded, list specific documents mentioned. If none are mentioned, return an empty array.
- For nextSteps, provide clear, actionable steps in chronological order. Each step must have a 'title' and 'detail'.
- For redFlags, identify any risks, hidden fees, unfair conditions, or unusually short deadlines. Return an empty array if none exist.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseAIResponse(rawText: string): SimplifyResult | null {
  let cleaned = rawText.trim();
  cleaned = cleaned
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.eligibility !== "string" ||
      !Array.isArray(parsed.documentsNeeded) ||
      !Array.isArray(parsed.nextSteps)
    ) {
      return null;
    }
    return parsed as SimplifyResult;
  } catch {
    return null;
  }
}

function isRetryable(error: any): boolean {
  const msg = error?.message || "";
  // Retry on 429, 5xx, network timeouts, or service unavailable
  return (
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("500") ||
    msg.includes("502") ||
    msg.includes("504") ||
    msg.includes("network") ||
    msg.includes("timeout") ||
    msg.includes("ECONNRESET") ||
    msg.includes("high demand") ||
    msg.includes("overloaded")
  );
}

async function generateWithRetry(
  fn: () => Promise<any>,
  maxRetries = 2,
  delayMs = 1000
): Promise<any> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries && isRetryable(err)) {
        console.warn(`[Saral /api/simplify] Retrying (attempt ${attempt + 1}/${maxRetries}) after error:`, err.message);
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      } else {
        break;
      }
    }
  }
  throw lastError;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inputType: "text" | "image" | "pdf" = body.type ?? "text";

    // ── Demo Mode (only when intentionally enabled via env var) ───────────────
    if (DEMO_MODE) {
      console.log("[Saral /api/simplify] DEMO_MODE is enabled — returning predefined response.");
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json(mockResponse());
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: Gemini API key is missing." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    let rawText: string;

    if (inputType === "text") {
      const { text } = body;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json({ error: "Please provide the document text to simplify." }, { status: 400 });
      }
      console.log("[Saral /api/simplify] text input, length:", text.trim().length);
      const result = await generateWithRetry(() =>
        model.generateContent(`Please simplify this document:\n\n${text.trim()}`)
      );
      rawText = result.response.text();
    } else if (inputType === "image") {
      const { data, mediaType } = body;
      if (!data || !mediaType) {
        return NextResponse.json({ error: "Missing image data." }, { status: 400 });
      }
      console.log("[Saral /api/simplify] image input, mediaType:", mediaType);
      const result = await generateWithRetry(() =>
        model.generateContent([
          "This image contains a government document or official notice. Please read all visible text in the image and simplify it according to your instructions.",
          { inlineData: { data, mimeType: mediaType } },
        ])
      );
      rawText = result.response.text();
    } else if (inputType === "pdf") {
      const { data } = body;
      if (!data) return NextResponse.json({ error: "Missing PDF data." }, { status: 400 });

      console.log("[Saral /api/simplify] PDF input received, sending directly to Gemini multimodal API");
      const result = await generateWithRetry(() =>
        model.generateContent([
          "This is a PDF document. Please read and simplify it according to your instructions.",
          { inlineData: { data, mimeType: "application/pdf" } },
        ])
      );
      rawText = result.response.text();
    } else {
      return NextResponse.json({ error: "Unknown input type." }, { status: 400 });
    }

    if (!rawText) throw new Error("Empty response from Gemini");

    const parsed = parseAIResponse(rawText);
    if (!parsed) {
      console.error("[Saral /api/simplify] Failed to parse AI JSON:", rawText);
      return NextResponse.json({ error: "The AI returned an unexpected format. Please try again." }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("[Saral /api/simplify] Final error after retries:", error?.message);
    return NextResponse.json(
      { error: "The AI service is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
