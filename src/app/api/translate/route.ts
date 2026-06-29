import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SimplifyResult } from "@root/types/index";

// ─── Demo Mode (only active when DEMO_MODE=true env var is set) ───────────────
const DEMO_MODE = process.env.DEMO_MODE === "true";

function isRetryable(error: any): boolean {
  const msg = error?.message || "";
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
        console.warn(`[Saral /api/translate] Retrying (attempt ${attempt + 1}/${maxRetries}):`, err.message);
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      } else {
        break;
      }
    }
  }
  throw lastError;
}

export async function POST(request: Request) {
  let targetLanguage: "hindi" | "telugu" = "hindi";
  try {
    let body;
    try {
      body = await request.json();
      targetLanguage = body.targetLanguage;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { result } = body as { result: SimplifyResult };

    if (!result || !targetLanguage) {
      return NextResponse.json({ error: "Missing result or targetLanguage." }, { status: 400 });
    }

    if (!["hindi", "telugu"].includes(targetLanguage)) {
      return NextResponse.json({ error: "Unsupported language. Use 'hindi' or 'telugu'." }, { status: 400 });
    }

    const langLabel = targetLanguage === "hindi" ? "Hindi" : "Telugu";

    const apiKey = process.env.GEMINI_API_KEY;

    // ─── Mock response (Demo Mode) ────────────────────────────────────────────────
    const mockHindi: SimplifyResult = {
      summary: "[डेमो मोड] यह एक सिम्युलेटेड प्रतिक्रिया है क्योंकि जेमिनी एपीआई कुंजी गायब है या अमान्य है।",
      eligibility: "[डेमो मोड] आप डमी मानदंडों के आधार पर पात्र प्रतीत होते हैं।",
      documentsNeeded: ["[डेमो] पहचान का प्रमाण", "[डेमो] पते का प्रमाण"],
      nextSteps: [{ title: "[डेमो] वास्तविक एपीआई में अपग्रेड करें", detail: "वास्तविक दस्तावेज़ विश्लेषण देखने के लिए, आपको एक वैध जेमिनी एपीआई कुंजी जोड़नी होगी।" }],
      redFlags: ["[डेमो] चेतावनी: यह आपके दस्तावेज़ का वास्तविक डेटा नहीं है।"]
    };

    const mockTelugu: SimplifyResult = {
      summary: "[డెమో మోడ్] జెమిని API కీ లేనందున లేదా చెల్లని కారణంగా ఇది అనుకరించబడిన ప్రతిస్పందన.",
      eligibility: "[డెమో మోడ్] డమ్మీ ప్రమాణాల ఆధారంగా మీరు అర్హులుగా కనిపిస్తున్నారు.",
      documentsNeeded: ["[డెమో] గుర్తింపు రుజువు", "[డెమో] చిరునామా రుజువు"],
      nextSteps: [{ title: "[డెమో] నిజమైన API కి అప్‌గ్రేడ్ చేయండి", detail: "నిజమైన పత్ర విశ్లేషణను చూడటానికి, మీరు చెల్లుబాటు అయ్యే జెమిని API కీని జోడించాలి." }],
      redFlags: ["[డెమో] హెచ్చరిక: ఇది మీ పత్రం నుండి నిజమైన డేటా కాదు."]
    };

    // ── Demo Mode (only when intentionally enabled via env var) ──────────────
    if (DEMO_MODE) {
      console.log("[Saral /api/translate] DEMO_MODE is enabled — returning predefined response.");
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json(targetLanguage === "hindi" ? mockHindi : mockTelugu);
    }

    // ── Check API key ─────────────────────────────────────────────────────────
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: Gemini API key is missing." },
        { status: 500 }
      );
    }

    // ── Real Gemini translation ─────────────────────────────────────────
    const systemPrompt = `You are a professional government document translator.

Your job is NOT to translate word-for-word.

Your job is to rewrite the content so it sounds as if it was originally written by a native speaker of the target language (${langLabel}).

Requirements:
- Preserve every piece of information.
- Preserve dates, names, amounts, and eligibility rules exactly.
- Never invent information.
- Never omit information.
- Use natural grammar.
- Use culturally appropriate expressions.
- Use language suitable for citizens with basic education.
- If a literal translation sounds unnatural, rewrite it naturally.
- Return ONLY valid JSON, in EXACTLY the same structure as the input. No markdown, no code fences, no explanation.
- Translate every string value: summary, eligibility, all strings in the documentsNeeded array, the title and detail of every object in the nextSteps array, and all strings in the redFlags array.
- Do NOT translate JSON keys — only string values.
- documentsNeeded items should be translated as short noun phrases.

Language-specific instructions:
- If translating to Hindi: Write natural Indian Hindi similar to official government citizen service portals. Avoid literal English sentence structures.
- If translating to Telugu: Write natural Telugu spoken in Andhra Pradesh and Telangana. Avoid literal translations. Use expressions commonly found in Telugu government service portals.`;

    const userMessage = `Translate this JSON to ${langLabel}:\n\n${JSON.stringify(result, null, 2)}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = await generateWithRetry(() => model.generateContent(userMessage));
    const rawText = response.response.text();

    if (!rawText) {
      return NextResponse.json({ error: "Received an empty response from the translator." }, { status: 502 });
    }

    // Strip markdown fences if present
    let cleaned = rawText.trim();
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    let parsed: SimplifyResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse translated JSON:", cleaned);
      return NextResponse.json({ error: "Translation returned an unexpected format. Please try again." }, { status: 502 });
    }

    // Validate shape
    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.eligibility !== "string" ||
      !Array.isArray(parsed.documentsNeeded) ||
      !Array.isArray(parsed.nextSteps)
    ) {
      return NextResponse.json({ error: "Translation returned an incomplete response. Please try again." }, { status: 502 });
    }

    console.log(`[Saral /api/translate] translated to ${langLabel}`);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("[Saral /api/translate] Final error after retries:", error?.message);
    return NextResponse.json(
      { error: "The AI service is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
