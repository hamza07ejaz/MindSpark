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
              "You are an academic quiz generator. Based on provided NOTES, create 5 question-answer pairs in strict JSON format as [{question: '', answer: ''}]. Make questions factual and answerable directly from the notes.",
          },
          { role: "user", content: notes },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      }),
    });

    const json = await response.json();
    let qna = json?.choices?.[0]?.message?.content || "[]";
    try {
      qna = JSON.parse(qna);
    } catch {
      qna = [];
    }

    return NextResponse.json({ qna });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}