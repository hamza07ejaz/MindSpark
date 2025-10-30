import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "No topic provided" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a study assistant that generates 5 question-answer pairs based on a topic." },
        { role: "user", content: `Generate 5 detailed Q&A pairs for the topic: ${topic}` },
      ],
    });

    const answer = completion.choices[0].message?.content ?? "No response from OpenAI";
    return NextResponse.json({ result: answer });
  } catch (error: any) {
    console.error("QnA API Error:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
