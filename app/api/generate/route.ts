import { NextResponse } from "next/server";

// Simulated temporary database (you can later replace with real one)
const notesLog = new Map();

export async function POST(req) {
  try {
    // Simulate user and plan
    const fakeUser = { id: "12345", plan: "free" }; // change to "premium" for testing

    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Text cannot be empty." },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const key = `${fakeUser.id}-${today}`;
    const count = notesLog.get(key) || 0;

    // limit check for free users
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

    // Generate AI notes (your original code)
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

    // Update fake note count
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
