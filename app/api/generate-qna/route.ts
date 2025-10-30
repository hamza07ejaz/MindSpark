import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `Generate 5 detailed study questions and answers for the topic "${topic}". 
    Each question should start with "Q:" and each answer with "A:".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0].message.content || "";
    const qna = content.split("\n").filter((line) => line.trim() !== "");

    return NextResponse.json({ qna });
  } catch (error) {
    console.error("Error generating QnA:", error);
    return NextResponse.json(
      { error: "Failed to generate Q&A." },
      { status: 500 }
    );
  }
}
