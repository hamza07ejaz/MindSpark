import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { subject, examDate, hoursPerDay } = await req.json();

    const prompt = `
You are an AI study planner. Create a detailed, structured daily study plan for the topic "${subject}".
The exam date is ${examDate}, and the student has ${hoursPerDay} hours per day to study.
The plan should include specific topics or subtopics for each day, review days, and breaks.
Format it neatly and clearly with days as headings and bullet points under each.
Make it motivational but realistic.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful study planner assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const plan = response.choices[0].message?.content || "No plan generated.";

    return NextResponse.json({ plan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ plan: "Error generating plan." });
  }
}
