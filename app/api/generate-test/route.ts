import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    // Ask for strict JSON using JSON Schema so the client can parse safely
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
      // JSON schema to force structure
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
