import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
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
    return NextResponse.json({ paraphrased: "Error generating paraphrased text." });
  }
}
