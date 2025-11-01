import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    console.log("Received topic:", topic);

    if (!topic || topic.trim() === "") {
      return NextResponse.json(
        { error: "Topic is required." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful study assistant that creates 5 clear and detailed Q&A pairs for students.",
        },
        {
          role: "user",
          content: `Generate 5 detailed question and answer pairs about: ${topic}`,
        },
      ],
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "No Q&A generated. Try again.";

    return NextResponse.json({ result: answer });
  } catch (error: any) {
    console.error("QnA Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
