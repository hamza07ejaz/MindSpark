import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

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
              "You are an AI assistant that generates clean, structured, and detailed study notes.",
          },
          {
            role: "user",
            content: `Generate detailed, structured study notes from this text:\n\n${text}`,
          },
        ],
        max_tokens: 700,
      }),
    });

    const data = await response.json();
    const notes = data.choices?.[0]?.message?.content || "No notes generated.";
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error generating notes:", error);
    return NextResponse.json({ error: "Failed to generate notes" }, { status: 500 });
  }
}
