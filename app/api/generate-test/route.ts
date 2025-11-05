import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Connect to Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // ✅ Authenticate and check user's plan
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
      return NextResponse.json({ error: "Tests are available only for Premium users." }, { status: 403 });
    }

    // ✅ Your original code starts here
    const { topic } = await req.json();
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You create exams. Output ONLY JSON that matches the provided schema. No markdown, no commentary."
        },
        {
          role: "user",
          content: `Make an exam for topic: "${topic}". Create:
- 8 multiple-choice questions (each exactly 4 options, one correct)
- 8 true/false statements
- 5 short-answer questions (1–2 sentence answer)
- 2 long-answer questions (3–5 sentence answer)
Keep language concise and student-friendly.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "StudyTest",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["mcqs", "trueFalse", "short", "long"],
            properties: {
              mcqs: {
                type: "array",
                minItems: 8,
                maxItems: 8,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["question", "options", "correctIndex"],
                  properties: {
                    question: { type: "string" },
                    options: {
                      type: "array",
                      minItems: 4,
                      maxItems: 4,
                      items: { type: "string" }
                    },
                    correctIndex: { type: "integer", minimum: 0, maximum: 3 }
                  }
                }
              },
              trueFalse: {
                type: "array",
                minItems: 8,
                maxItems: 8,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["statement", "answer"],
                  properties: {
                    statement: { type: "string" },
                    answer: { type: "boolean" }
                  }
                }
              },
              short: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["question", "answer"],
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" }
                  }
                }
              },
              long: {
                type: "array",
                minItems: 2,
                maxItems: 2,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["question", "answer"],
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" }
                  }
                }
              }
            }
          }
        }
      },
      temperature: 0.3,
      max_tokens: 1200
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const test = JSON.parse(raw);

    return NextResponse.json({ test });
  } catch (err: any) {
    console.error("generate-test error:", err?.message || err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
