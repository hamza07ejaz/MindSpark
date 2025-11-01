import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful study assistant that creates 5 question-answer pairs.",
        },
        {
          role: "user",
          content: `Generate 5 detailed Q&A pairs about: ${topic}`,
        },
      ],
    });

    const answer =
      completion.choices?.[0]?.message?.content || "No Q&A generated. Try again.";
    return NextResponse.json({ result: answer });
  } catch (error: any) {
    console.error("QnA API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
