import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, tone } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text input." }, { status: 400 });
    }

    // ✅ Premium check using Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { session } } = await supabase.auth.getSession();

    // If not logged in → block
    if (!session?.user) {
      return NextResponse.json({ error: "Please log in to use this feature." }, { status: 401 });
    }

    // Check user's plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.plan !== "premium") {
      return NextResponse.json(
        { error: "Upgrade to Premium to use the Grammar feature." },
        { status: 403 }
      );
    }

    const prompt = `
You are a professional grammar corrector and tone improver.
Fix grammar, punctuation, and clarity while keeping the same meaning.
Use the following tone: ${tone}.
Return JSON with these keys:
{
  "corrected": "the full corrected text",
  "changes": [
    { "from": "wrong text", "to": "corrected text", "reason": "why the change was made" }
  ]
}
Respond only in valid JSON.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt + "\nText:\n" + text }],
      temperature: 0.3,
    });

    let content = completion.choices[0]?.message?.content?.trim() || "{}";

    // Extract only JSON in case of extra text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response from model.");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Grammar API Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
