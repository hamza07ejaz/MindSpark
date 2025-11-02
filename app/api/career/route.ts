import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { mode, role, answers } = await req.json();

    let prompt = "";

    if (mode === "opt1") {
      prompt = `
You are an expert career advisor. The user wants to become a ${role}.
Create a professional step-by-step roadmap including:
1. Short description of the career and why it matters
2. Skills and knowledge required
3. Education or certifications needed
4. 12-month plan (divide into quarters)
5. First job roles and pay range
6. Fast-track strategies

Make the content concise, inspiring, and formatted in bullet points.
      `;
    } else if (mode === "opt2") {
      prompt = `
You are a career counselor. Based on these answers, suggest 3 potential careers:
${JSON.stringify(answers, null, 2)}

For each career, include:
1. Why it matches the user's interests
2. What they need to study or learn
3. Step-by-step plan to start
4. Add motivational closing.

Format clearly with headers for each career.
      `;
    } else if (mode === "opt3") {
      prompt = `
You are a business mentor. The user wants to earn side income. Here are their answers:
${JSON.stringify(answers, null, 2)}

Suggest 3 personalized, realistic side income ideas based on their situation.
For each idea, include:
1. What it is and how it works
2. How to start immediately
3. Potential monthly earning
4. Steps to scale it up
5. Bonus tip.

Keep it motivating, practical, and formatted cleanly.
      `;
    } else {
      return NextResponse.json(
        { error: "Invalid mode" },
        { status: 400 }
      );
    }

    // Call OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional career and business coach generating clear, structured results.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const text = completion.choices[0].message?.content || "";

    // Split into blocks for display
    const blocks = text
      .split(/\n(?=[A-Z][^\n]{3,}:|###|1\.|Career|Idea|Step)/)
      .filter((b) => b.trim().length > 10)
      .map((b) => {
        const lines = b.trim().split("\n");
        const title = lines.shift() || "Section";
        return { title: title.replace(/[#*]/g, "").trim(), body: lines.join("\n").trim() };
      });

    return NextResponse.json({ blocks });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate career guidance" },
      { status: 500 }
    );
  }
}
