import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const prompt = `
    Create 5 flashcards about "${topic}". 
    Respond in strict JSON format:
    [
      {"question": "...", "answer": "..."},
      {"question": "...", "answer": "..."}
    ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content?.trim() || "[]";

    // ✅ Clean JSON (avoid double parsing errors)
    let flashcards;
    try {
      flashcards = JSON.parse(text);
    } catch {
      flashcards = [{ question: "Error parsing JSON", answer: text }];
    }

    return NextResponse.json({ flashcards });
  } catch (err: any) {
    console.error("Flashcard API Error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
