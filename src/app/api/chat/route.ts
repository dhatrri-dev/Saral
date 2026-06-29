import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are Saral's AI assistant, designed to help Indian citizens understand government schemes, legal documents, and official procedures.
Your audience may have limited formal education or literacy, so you MUST use extremely simple, plain language. Avoid bureaucratic jargon completely.
Improve your responses by making them personalized, confident, and concise.
Recommend ONLY relevant government schemes based on the user's profile.
Avoid unnecessary uncertainty (do not use words like "might" or "maybe").
Format your answers clearly with headings and bullet points.
Always end your response with exactly one helpful follow-up question.`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
    });

    const history = messages
      .slice(0, -1)
      .filter((msg: any, idx: number) => !(idx === 0 && msg.role === "assistant"))
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

    const latestMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(latestMessage);
    const replyText = result.response.text();

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Unexpected error in /api/chat:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
