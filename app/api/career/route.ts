import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { mode, role, answers } = await req.json();

    let prompt = "";

    // === Build prompt based on mode ===
    if (mode === "opt1") {
      prompt = `
You are a world-class career mentor. The user wants to become a ${role}.
Create a full professional roadmap including:
1. Description of this career
2. Skills & education needed
3. 12-month learning roadmap (Q1–Q4)
4. Entry-level job titles & salary
5. Long-term success tips
Keep it inspiring and clear.
      `;
    } else if (mode === "opt2") {
      prompt = `
You are a friendly career counselor. Here are the user's answers:
${JSON.stringify(answers, null, 2)}
Based on these, suggest 3 career paths that fit their personality.
For each path:
1. Short description
2. Why it's a match
3. What to learn
4. Steps to start
5. Motivational note
      `;
    } else if (mode === "opt3") {
      prompt = `
You are an expert side-income coach. The user wants to earn part-time. Answers:
${JSON.stringify(answers, null, 2)}
Suggest 3 income ideas that are realistic and fun.
For each:
1. What it is
2. How to start today
3. How much they can earn
4. How to grow it
5. Bonus tip
      `;
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    // === Try AI call ===
    let text = "";
    try {
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional career and income advisor who writes clear, structured plans with headings.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      });
      text = res.choices[0].message?.content || "";
    } catch (err) {
      console.warn("AI call failed, using fallback data");
    }

    // === Fallback ===
    if (!text) {
      if (mode === "opt1") {
        text = `
Career Goal: ${role}

Step 1: Learn the basics – Study free resources on YouTube, Coursera, or books.
Step 2: Build foundation – Practice projects, join communities.
Step 3: Gain credibility – Take a certification or course.
Step 4: Build portfolio – Showcase small achievements.
Step 5: Apply for internships or freelance roles.
Step 6: Grow by networking, reading, and sharing your work.
      `;
      } else if (mode === "opt2") {
        text = `
Possible Careers Based on Your Answers:

1. Digital Marketing
   - Uses creativity and strategy.
   - Learn SEO, content, ads.
   - Start with freelancing or small projects.

2. Software Development
   - Great for logical thinkers.
   - Learn coding basics, build small apps.
   - Start with internships or open-source work.

3. Business & Sales
   - Perfect for communicators.
   - Learn persuasion, cold outreach, and business.
   - Start selling products or services locally.
      `;
      } else if (mode === "opt3") {
        text = `
Side Income Ideas:

1. Freelance Design or Writing
   - Use Fiverr or Upwork.
   - Start free, then scale your clients.

2. Tutoring or Teaching
   - Teach what you know online.
   - Platforms: Preply, Wyzant, YouTube.

3. Social Media Services
   - Help small businesses manage TikTok or Instagram.
   - Start with 2–3 clients and grow from there.
      `;
      }
    }

    // === Format output ===
    const blocks = text
      .split(/\n(?=[A-Z0-9#*].{3,}:|Career|Step|Idea|1\.|###)/)
      .filter((b) => b.trim().length > 5)
      .map((b) => {
        const lines = b.trim().split("\n");
        const title = lines.shift() || "Section";
        return {
          title: title.replace(/[#*]/g, "").trim(),
          body: lines.join("\n").trim(),
        };
      });

    return NextResponse.json({ blocks });
  } catch (err) {
    console.error("Fatal error:", err);
    return NextResponse.json(
      { error: "Failed to generate career guidance" },
      { status: 500 }
    );
  }
}
