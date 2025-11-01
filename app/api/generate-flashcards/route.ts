import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert study assistant that generates flashcards for learning. Each card should have a concise question and a clear, memorable answer.",
        },
        {
          role: "user",
          content: `Generate 10 flashcards (question and answer) about: ${topic}. Format as JSON: [{"question": "...", "answer": "..."}]`,
        },
      ],
    });

    const content = completion.choices[0].message?.content || "[]";
    const flashcards = JSON.parse(content);
    return NextResponse.json({ flashcards });
  } catch (error: any) {
    console.error("Flashcards API Error:", error);
    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
