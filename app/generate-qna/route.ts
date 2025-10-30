import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { notes } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an academic QnA generator. Based on the provided NOTES, generate exactly 5 question-answer pairs in valid JSON format: [{question:'', answer:''}]. Ensure the output is pure JSON only.",
          },
          { role: "user", content: notes },
        ],
      }),
    });

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || "[]";

    let qna;
    try {
      qna = JSON.parse(raw);
    } catch (e) {
      console.error("Invalid JSON received:", raw);
      qna = [];
    }

    return NextResponse.json({ qna });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate QnA" },
      { status: 500 }
    );
  }
}