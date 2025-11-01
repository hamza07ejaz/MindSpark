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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful study assistant that creates 5 question–answer pairs on the given topic.",
        },
        {
          role: "user",
          content: `Generate 5 detailed Q&A pairs about: ${topic}`,
        },
      ],
    });

    const answer = completion.choices[0].message?.content || "No result found.";
    return NextResponse.json({ result: answer });
  } catch (error: any) {
    console.error("QnA Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Server Error" },
      { status: 500 }
    );
  }
}
