import { NextResponse } from "next/server";

// simple in-memory log (resets on every deploy)
const notesLog = new Map<string, number>();

export async function POST(req: Request): Promise<NextResponse> {
  try {
    // simulate user
    const fakeUser = { id: "12345", plan: "free" }; // change to "premium" for testing

    const body = await req.json();
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Text cannot be empty." }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    const key = `${fakeUser.id}-${today}`;
    const count = notesLog.get(key) || 0;

    if (fakeUser.plan === "free" && count >= 2) {
      return NextResponse.json(
        {
          error:
            "You’ve reached your daily limit of 2 notes. Upgrade to Premium for unlimited notes.",
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // generate AI notes
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

    notesLog.set(key, count + 1);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error generating notes:", error);
    return NextResponse.json(
      { error: "Failed to generate notes." },
      { status: 500 }
    );
  }
}
