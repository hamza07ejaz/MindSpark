import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Create a Supabase client that can read auth session headers
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { paraphrased: "You must be logged in to use this feature." },
        { status: 401 }
      );
    }

    // Check user's plan
    const { data, error } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (error || !data || data.plan !== "premium") {
      return NextResponse.json(
        { paraphrased: "This feature is for premium users only." },
        { status: 403 }
      );
    }

    const { text } = await req.json();
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ paraphrased: "No text provided." });
    }

    const prompt = `
      Paraphrase the following text in clear, natural, and professional English.
      Keep the same meaning but make it smoother and more concise:
      "${text}"
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const paraphrased = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ paraphrased });
  } catch (error) {
    console.error("Error generating paraphrased text:", error);
    return NextResponse.json(
      { paraphrased: "Error generating paraphrased text." },
      { status: 500 }
    );
  }
}
