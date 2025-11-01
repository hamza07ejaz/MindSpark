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
    You are a flashcard generator.
    Create exactly 5 flashcards about "${topic}".
    Each flashcard must have a "question" and "answer" field.
    Reply ONLY in valid JSON array format, like this:
    [
      {"question": "What is AI?", "answer": "Artificial Intelligence"},
      {"question": "What is ML?", "answer": "Machine Learning"}
    ]
    Do NOT include extra text before or after JSON.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let text = completion.choices[0]?.message?.content?.trim() || "[]";

    // ✅ Auto-clean output to ensure valid JSON
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.slice(jsonStart, jsonEnd + 1);
    }

    let flashcards;
    try {
      flashcards = JSON.parse(text);
    } catch {
      console.error("Invalid JSON from model:", text);
      flashcards = [{ question: "Error", answer: "Invalid format returned from AI" }];
    }

    return NextResponse.json({ flashcards });
  } catch (err: any) {
    console.error("Flashcard API Error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
