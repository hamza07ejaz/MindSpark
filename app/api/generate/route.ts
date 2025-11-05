import { NextResponse } from "next/server";
import gighub from "@/lib/gighub"; // adjust if your GigHub client is elsewhere

export async function POST(req: Request) {
  try {
    const user = await gighub.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const plan = user?.plan || "free";

    // Check daily note limit for free users
    const today = new Date().toISOString().split("T")[0];
    const notesToday = await gighub.db.notes
      .where("user_id", "==", user.id)
      .where("date", "==", today)
      .count();

    if (plan === "free" && notesToday >= 2) {
      return NextResponse.json(
        {
          error:
            "You’ve reached your daily limit of 2 notes. Upgrade to Premium for unlimited notes.",
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // --- original AI note generation (unchanged) ---
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

    // Save note in your database (for tracking)
    await gighub.db.notes.insert({
      user_id: user.id,
      date: today,
      content: notes,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error generating notes:", error);
    return NextResponse.json(
      { error: "Failed to generate notes" },
      { status: 500 }
    );
  }
}
