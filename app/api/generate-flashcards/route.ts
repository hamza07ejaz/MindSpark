import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Connect Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // ✅ Get user from request (assuming you’re using Clerk or Supabase Auth)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    // ✅ Check user plan in Supabase
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.plan !== "premium") {
      return NextResponse.json({ error: "Flashcards are for Premium users only." }, { status: 403 });
    }

    // ✅ Proceed with your existing code
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const prompt = `
    You are a flashcard generator.
    Create exactly 5 flashcards about "${topic}".
    Each flashcard must have a "question" and "answer" field.
    Reply ONLY in valid JSON array format, like this:
    [
      {"question": "What is AI?", "answer": "Artificial Intelligence"},
      {"question": "What is ML?", "answer": "Machine Learning"}
    ]
    Do NOT include extra text before or after JSON.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let text = completion.choices[0]?.message?.content?.trim() || "[]";

    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.slice(jsonStart, jsonEnd + 1);
    }

    let flashcards;
    try {
      flashcards = JSON.parse(text);
    } catch {
      console.error("Invalid JSON from model:", text);
      flashcards = [{ question: "Error", answer: "Invalid format returned from AI" }];
    }

    return NextResponse.json({ flashcards });
  } catch (err: any) {
    console.error("Flashcard API Error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
