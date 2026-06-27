import { NextResponse } from "next/server";
import type { SimplifyResult } from "@root/types/index";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { result, targetLanguage } = body as {
      result: SimplifyResult;
      targetLanguage: "hindi" | "telugu";
    };

    if (!result || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing result or targetLanguage." },
        { status: 400 }
      );
    }

    if (!["hindi", "telugu"].includes(targetLanguage)) {
      return NextResponse.json(
        { error: "Unsupported language. Use 'hindi' or 'telugu'." },
        { status: 400 }
      );
    }

    const langLabel = targetLanguage === "hindi" ? "Hindi" : "Telugu";

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // ── No API key → mock translated response ──────────────────────────────
    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 1500));

      // Return a clearly mock-translated version for UI testing
      const mockHindi: SimplifyResult = {
        summary:
          "यह एक सरकारी अधिसूचना है जिसमें कहा गया है कि आपको अपने पते का प्रमाण और एक आय प्रमाण पत्र जमा करना होगा। यदि आप 30 दिनों के भीतर ये दस्तावेज़ जमा नहीं करते, तो आपका आवेदन स्वतः अस्वीकृत हो जाएगा।",
        eligibility:
          "आपके पास एक वैध अधिवास प्रमाण पत्र होना चाहिए, और आपका आय प्रमाण पत्र पिछले 12 महीनों के भीतर जारी किया गया होना चाहिए।",
        documentsNeeded: [
          "अधिवास प्रमाण पत्र (पते का प्रमाण)",
          "आय प्रमाण पत्र (12 महीने से अधिक पुराना नहीं)",
          "सत्यापित शपथ पत्र",
        ],
        nextSteps: [
          {
            title: "अपने दस्तावेज़ इकट्ठा करें",
            detail: "सुनिश्चित करें कि आपके पास मूल अधिवास प्रमाण पत्र और हालिया आय प्रमाण पत्र है।",
          },
          {
            title: "शपथ पत्र को सत्यापित कराएं",
            detail: "आवश्यक शपथ पत्र को सत्यापित कराने के लिए स्थानीय नोटरी के पास जाएं। जल्द से जल्द यह करें।",
          },
          {
            title: "समय सीमा तक जमा करें!",
            detail: "स्वतः अस्वीकृति से बचने के लिए अधिसूचना जारी होने की तिथि से 30 दिनों के भीतर सभी दस्तावेज़ जमा करें।",
          },
        ],
      };

      const mockTelugu: SimplifyResult = {
        summary:
          "ఈ ప్రభుత్వ నోటీసు మీరు మీ చిరునామా రుజువు మరియు ఆదాయ ధృవీకరణ పత్రాన్ని సమర్పించాలని పేర్కొంటుంది. మీరు 30 రోజులలోపు ఈ పత్రాలు సమర్పించకపోతే, మీ దరఖాస్తు స్వయంచాలకంగా తిరస్కరించబడుతుంది.",
        eligibility:
          "మీకు చెల్లుబాటు అయ్యే నివాస ధృవీకరణ పత్రం ఉండాలి మరియు మీ ఆదాయ ధృవీకరణ పత్రం గత 12 నెలల్లో జారీ చేయబడి ఉండాలి.",
        documentsNeeded: [
          "నివాస ధృవీకరణ పత్రం (చిరునామా రుజువు)",
          "ఆదాయ ధృవీకరణ పత్రం (12 నెలల కంటే పాతది కాదు)",
          "ధృవీకరించిన అఫిడవిట్",
        ],
        nextSteps: [
          {
            title: "మీ పత్రాలను సేకరించండి",
            detail: "మీకు మూల నివాస ధృవీకరణ పత్రం మరియు తాజా ఆదాయ ధృవీకరణ పత్రం ఉందని నిర్ధారించుకోండి.",
          },
          {
            title: "అఫిడవిట్‌ను ధృవీకరించండి",
            detail: "అవసరమైన అఫిడవిట్‌ను ధృవీకరించడానికి స్థానిక నోటరీని సందర్శించండి. వీలైనంత త్వరగా చేయండి.",
          },
          {
            title: "గడువుకు లోపల సమర్పించండి!",
            detail: "స్వయంచాలక తిరస్కరణను నివారించడానికి నోటీసు జారీ తేదీ నుండి 30 రోజులలోపు అన్ని పత్రాలు సమర్పించండి.",
          },
        ],
      };

      return NextResponse.json(targetLanguage === "hindi" ? mockHindi : mockTelugu);
    }

    // ── Real Anthropic translation ─────────────────────────────────────────
    const systemPrompt = `You are a professional government-document translator. Translate all text values in the provided JSON into ${langLabel}. 

Rules:
- Return ONLY valid JSON, in EXACTLY the same structure as the input. No markdown, no code fences, no explanation.
- Translate every string value: summary, eligibility, all strings in the documentsNeeded array, and the title and detail of every object in the nextSteps array.
- Do NOT translate JSON keys — only string values.
- Preserve the meaning accurately. Use formal, clear language appropriate for government documents.
- documentsNeeded items should be translated as short noun phrases (e.g. "Aadhaar Card" → "आधार कार्ड").`;

    const userMessage = `Translate this JSON to ${langLabel}:\n\n${JSON.stringify(result, null, 2)}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Anthropic translation error:", response.status, errBody);
      return NextResponse.json(
        { error: "Translation failed. Please try again." },
        { status: 502 }
      );
    }

    const aiRes = await response.json();
    const rawText =
      aiRes.content?.[0]?.type === "text" ? aiRes.content[0].text : "";

    if (!rawText) {
      return NextResponse.json(
        { error: "Received an empty response from the translator." },
        { status: 502 }
      );
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
      return NextResponse.json(
        { error: "Translation returned an unexpected format. Please try again." },
        { status: 502 }
      );
    }

    // Validate shape
    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.eligibility !== "string" ||
      !Array.isArray(parsed.documentsNeeded) ||
      !Array.isArray(parsed.nextSteps)
    ) {
      return NextResponse.json(
        { error: "Translation returned an incomplete response. Please try again." },
        { status: 502 }
      );
    }

    console.log(`[Saral /api/translate] translated to ${langLabel}`);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Unexpected error in /api/translate:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
