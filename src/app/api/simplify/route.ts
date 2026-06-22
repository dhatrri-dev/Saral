import { NextResponse } from "next/server";
import type { SimplifyResult } from "@root/types/index";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide the document text to simplify." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // If no API key is provided, return a very high quality mock response
    // so the user can test the UI and see the intended functionality.
    if (!apiKey) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResponse: SimplifyResult = {
        summary: "This is a government notification stating that you must provide proof of your address and an income certificate. If you do not submit these within 30 days of the notice, your application will be automatically rejected.",
        eligibility: "You must be a resident of the area with a valid domicile certificate, and your income certificate must have been issued within the last 12 months.",
        documentsNeeded: [
          "Domicile Certificate (Proof of Address)",
          "Income Certificate (Not older than 12 months)",
          "Attested Affidavit"
        ],
        nextSteps: [
          {
            title: "Gather your documents",
            detail: "Make sure you have your original domicile certificate and a recent income certificate."
          },
          {
            title: "Get an affidavit attested",
            detail: "Visit a local notary to get the required affidavit attested. Do this as soon as possible."
          },
          {
            title: "Submit by the deadline!",
            detail: "Submit all documents within 30 days of the notice issuance date to avoid automatic rejection."
          }
        ]
      };
      
      return NextResponse.json(mockResponse);
    }

    const systemPrompt = `You are a plain-language explainer for confusing official and government documents. Your audience is ordinary citizens who may have no background knowledge of legal or bureaucratic terminology.

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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Please simplify this document:\n\n${text.trim()}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Anthropic API error:", response.status, errorBody);
      return NextResponse.json(
        { error: "Failed to process the document. Please try again." },
        { status: 502 }
      );
    }

    const aiResponse = await response.json();

    const rawText =
      aiResponse.content?.[0]?.type === "text"
        ? aiResponse.content[0].text
        : "";

    if (!rawText) {
      console.error("Empty AI response:", JSON.stringify(aiResponse));
      return NextResponse.json(
        { error: "Received an empty response. Please try again." },
        { status: 502 }
      );
    }

    let cleanedText = rawText.trim();
    cleanedText = cleanedText
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    let parsed: SimplifyResult;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse AI JSON:", cleanedText);
      return NextResponse.json(
        { error: "The AI returned an unexpected format. Please try again." },
        { status: 502 }
      );
    }

    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.eligibility !== "string" ||
      !Array.isArray(parsed.documentsNeeded) ||
      !Array.isArray(parsed.nextSteps)
    ) {
      console.error("Invalid response shape:", parsed);
      return NextResponse.json(
        { error: "The AI returned an incomplete response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Unexpected error in /api/simplify:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
