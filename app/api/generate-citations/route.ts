import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

// ✅ Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Body = { topic?: string; style?: "APA"|"MLA"|"Chicago"; count?: number };

export async function POST(req: NextRequest) {
  try {
    // ✅ Check user plan (premium only)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.plan !== "premium") {
      return new Response(
        JSON.stringify({ error: "Citations feature is available only for Premium users." }),
        { status: 403 }
      );
    }

    // ✅ Your original code starts here
    const { topic = "", style = "APA", count = 6 } = (await req.json()) as Body;
    const safeCount = Math.min(8, Math.max(5, Number(count) || 6));
    const prompt = buildPrompt(topic, style, safeCount);

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You format citations precisely. Output only a JSON array of strings." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
        }),
      });

      const json = await resp.json();
      const raw = json?.choices?.[0]?.message?.content ?? "[]";
      let arr: string[] = [];
      try {
        arr = JSON.parse(raw);
      } catch {
        arr = String(raw)
          .split("\n")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      const citations = arr.slice(0, safeCount).map((t) => ({ text: t }));
      return new Response(JSON.stringify({ citations }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fallback = mockCitations(topic, style, safeCount).map((t) => ({ text: t }));
    return new Response(JSON.stringify({ citations: fallback }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ citations: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function buildPrompt(topic: string, style: string, count: number) {
  return `
Generate ${count} credible ${style} citations about "${topic}".
Return ONLY a JSON array of strings — each string is one fully formatted citation.
No commentary, no extra keys, no markdown.
If a URL is used, ensure it's plausible and stable; prefer books, journals, reputable sites.
  `.trim();
}

function mockCitations(topic: string, style: string, count: number): string[] {
  const year = new Date().getFullYear();
  const base = [
    { author: "Smith, A.", title: `Foundations of ${topic}`, publisher: "Scholarly Press", city: "New York", year },
    { author: "Khan, R.", title: `${topic}: A Comprehensive Review`, publisher: "Global Academic", city: "London", year: year - 1 },
    { author: "Chen, L.", title: `Modern Perspectives on ${topic}`, publisher: "University Press", city: "Cambridge", year: year - 2 },
    { author: "Garcia, M.", title: `The Impact of ${topic}`, publisher: "Insight Books", city: "Toronto", year: year - 3 },
    { author: "Patel, S.", title: `${topic} in Practice`, publisher: "Fieldhouse", city: "Chicago", year: year - 1 },
    { author: "Dubois, C.", title: `Historical Views of ${topic}`, publisher: "Heritage", city: "Paris", year: year - 4 },
    { author: "Okafor, T.", title: `Applied ${topic} Methods`, publisher: "Vector", city: "Lagos", year: year - 2 },
    { author: "Yamada, H.", title: `Emerging Trends in ${topic}`, publisher: "Pacific Press", city: "Tokyo", year: year - 1 },
  ];
  const pick = base.slice(0, count);

  if (style === "APA") {
    return pick.map((b) => `${b.author} (${b.year}). ${b.title}. ${b.city}: ${b.publisher}.`);
  }
  if (style === "MLA") {
    return pick.map((b) => `${b.author} ${b.title}. ${b.publisher}, ${b.year}.`);
  }
  return pick.map((b) => `${b.author} ${b.title}. ${b.city}: ${b.publisher}, ${b.year}.`);
}
