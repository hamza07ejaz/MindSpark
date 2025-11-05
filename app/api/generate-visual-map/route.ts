import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Supabase connection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // ✅ Auth + plan check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.plan !== "premium") {
      return NextResponse.json(
        { error: "Visual Map is available only for Premium users." },
        { status: 403 }
      );
    }

    // ✅ Your original logic starts here — unchanged
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "Missing topic." }, { status: 400 });
    }

    const prompt = `
Generate a structured JSON object for an AI knowledge map about "${topic}".
Each node must include:
- id (unique short id)
- label (concept title)
- details (2-3 sentence explanation)
Also return edges connecting them logically.
Example format:
{
  "nodes": [
    {"id":"1","label":"Causes","details":"The main reasons ..."},
    {"id":"2","label":"Effects","details":"The consequences ..."}
  ],
  "edges":[{"from":"1","to":"2"}]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid model output." }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error("Bad response shape.");
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("visual-map API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error." },
      { status: 500 }
    );
  }
}
