import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// simple in-memory tracker (resets when redeployed)
const qnaLog = new Map<string, string>();

export async function POST(req: Request) {
  try {
    // simulate user (replace later with real auth)
    const fakeUser = { id: "12345", plan: "free" }; // change to "premium" for testing

    const { topic } = await req.json();

    if (!topic || topic.trim() === "") {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    // Limit for free users: one QnA per 24h
    const lastUsed = qnaLog.get(fakeUser.id);
    const now = Date.now();
    if (fakeUser.plan === "free" && lastUsed && now - Number(lastUsed) < 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        {
          error:
            "You’ve used your free QnA for today. Come back after 24 hours or upgrade to Premium for unlimited questions.",
          upgrade: true,
        },
        { status: 403 }
      );
    }

    // generate Q&A
    const prompt = `
You are a helpful AI study assistant.  
Generate 10 high-quality, educational Q&A pairs about the topic "${topic}".  
Include:
1. 4 factual or concept questions
2. 3 application or reasoning questions
3. 2 critical thinking or analysis questions
4. 1 summary or conclusion question  

Each response must be in **JSON format** as an array of objects like this:
[
  { "question": "What is ...?", "answer": "..." },
  { "question": "How does ...?", "answer": "..." }
]
Keep answers short, clear, and directly useful for studying.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a precise and educational assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    let text = completion.choices[0].message?.content || "";
    let qna = [];

    try {
      qna = JSON.parse(text);
    } catch {
      const match = text.match(/\[([\s\S]*)\]/);
      if (match) {
        qna = JSON.parse(match[0]);
      }
    }

    if (!Array.isArray(qna) || qna.length === 0) {
      return NextResponse.json({ error: "Failed to generate valid Q&A." }, { status: 500 });
    }

    // record usage
    qnaLog.set(fakeUser.id, now.toString());

    return NextResponse.json({ qna });
  } catch (error) {
    console.error("QnA API Error:", error);
    return NextResponse.json(
      { error: "An error occurred while generating Q&A." },
      { status: 500 }
    );
  }
}
