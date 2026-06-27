import { NextResponse } from "next/server";
import type { SimplifyResult } from "@root/types/index";

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
  ]
}

Rules:
- ONLY output the JSON object. Nothing else.
- Keep the summary accessible — imagine explaining to a family member who doesn't read official documents.
- For eligibility, be honest about uncertainty. If the document is a general notice with no eligibility criteria, say "This document applies to everyone" or similar.
- For documentsNeeded, list specific documents mentioned. If none are mentioned, return an empty array.
- For nextSteps, provide clear, actionable steps in chronological order. Each step must have a 'title' and 'detail'.`;

// ─── Mock response (no API key) ───────────────────────────────────────────────
function mockResponse(): SimplifyResult {
  return {
    summary:
      "This is a government notification stating that you must provide proof of your address and an income certificate. If you do not submit these within 30 days of the notice, your application will be automatically rejected.",
    eligibility:
      "You must be a resident of the area with a valid domicile certificate, and your income certificate must have been issued within the last 12 months.",
    documentsNeeded: [
      "Domicile Certificate (Proof of Address)",
      "Income Certificate (Not older than 12 months)",
      "Attested Affidavit",
    ],
    nextSteps: [
      {
        title: "Gather your documents",
        detail:
          "Make sure you have your original domicile certificate and a recent income certificate.",
      },
      {
        title: "Get an affidavit attested",
        detail:
          "Visit a local notary to get the required affidavit attested. Do this as soon as possible.",
      },
      {
        title: "Submit by the deadline!",
        detail:
          "Submit all documents within 30 days of the notice issuance date to avoid automatic rejection.",
      },
    ],
  };
}

// ─── Parse & validate Anthropic JSON response ─────────────────────────────────
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

// ─── Call Anthropic API ───────────────────────────────────────────────────────
async function callAnthropic(
  apiKey: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userContent: any
): Promise<Response> {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    }),
  });
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ── Determine input type ──────────────────────────────────────────────────
    const inputType: "text" | "image" | "pdf" = body.type ?? "text";

    // ── No API key → mock ─────────────────────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 2000));
      return NextResponse.json(mockResponse());
    }

    // ── TEXT ──────────────────────────────────────────────────────────────────
    if (inputType === "text") {
      const { text } = body;
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json(
          { error: "Please provide the document text to simplify." },
          { status: 400 }
        );
      }

      console.log("[Saral /api/simplify] text input, length:", text.trim().length);

      const userContent = `Please simplify this document:\n\n${text.trim()}`;
      const res = await callAnthropic(apiKey, userContent);

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Anthropic API error:", res.status, errBody);
        return NextResponse.json(
          { error: "Failed to process the document. Please try again." },
          { status: 502 }
        );
      }

      const aiRes = await res.json();
      const rawText = aiRes.content?.[0]?.type === "text" ? aiRes.content[0].text : "";
      const parsed = parseAIResponse(rawText);
      if (!parsed) {
        console.error("Failed to parse AI JSON for text input:", rawText);
        return NextResponse.json(
          { error: "The AI returned an unexpected format. Please try again." },
          { status: 502 }
        );
      }
      return NextResponse.json(parsed);
    }

    // ── IMAGE ─────────────────────────────────────────────────────────────────
    if (inputType === "image") {
      const { data, mediaType } = body;
      if (!data || !mediaType) {
        return NextResponse.json(
          { error: "Missing image data." },
          { status: 400 }
        );
      }

      console.log("[Saral /api/simplify] image input, mediaType:", mediaType);

      const userContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: data,
          },
        },
        {
          type: "text",
          text: "This image contains a government document or official notice. Please read all visible text in the image and simplify it according to your instructions.",
        },
      ];

      const res = await callAnthropic(apiKey, userContent);

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Anthropic API error (image):", res.status, errBody);
        return NextResponse.json(
          { error: "Failed to process the image. Please try again." },
          { status: 502 }
        );
      }

      const aiRes = await res.json();
      const rawText = aiRes.content?.[0]?.type === "text" ? aiRes.content[0].text : "";
      const parsed = parseAIResponse(rawText);
      if (!parsed) {
        console.error("Failed to parse AI JSON for image input:", rawText);
        return NextResponse.json(
          { error: "The AI returned an unexpected format. Please try again." },
          { status: 502 }
        );
      }
      return NextResponse.json(parsed);
    }

    // ── PDF ───────────────────────────────────────────────────────────────────
    if (inputType === "pdf") {
      const { data } = body;
      if (!data) {
        return NextResponse.json({ error: "Missing PDF data." }, { status: 400 });
      }

      console.log("[Saral /api/simplify] PDF input received");

      let extractedText = "";
      try {
        // Dynamically import pdf-parse to avoid edge runtime issues
        const pdfParse = (await import("pdf-parse")).default;
        const buffer = Buffer.from(data, "base64");
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text?.trim() ?? "";
      } catch (err) {
        console.error("pdf-parse error:", err);
        extractedText = "";
      }

      if (!extractedText || extractedText.length < 20) {
        // Scanned PDF — no selectable text
        return NextResponse.json(
          {
            error:
              "This PDF appears to be scanned — please upload it as a JPG/PNG instead.",
          },
          { status: 422 }
        );
      }

      console.log("[Saral /api/simplify] PDF extracted text length:", extractedText.length);

      const userContent = `Please simplify this document:\n\n${extractedText}`;
      const res = await callAnthropic(apiKey, userContent);

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Anthropic API error (PDF):", res.status, errBody);
        return NextResponse.json(
          { error: "Failed to process the PDF. Please try again." },
          { status: 502 }
        );
      }

      const aiRes = await res.json();
      const rawText = aiRes.content?.[0]?.type === "text" ? aiRes.content[0].text : "";
      const parsed = parseAIResponse(rawText);
      if (!parsed) {
        console.error("Failed to parse AI JSON for PDF input:", rawText);
        return NextResponse.json(
          { error: "The AI returned an unexpected format. Please try again." },
          { status: 502 }
        );
      }
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ error: "Unknown input type." }, { status: 400 });
  } catch (error) {
    console.error("Unexpected error in /api/simplify:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
