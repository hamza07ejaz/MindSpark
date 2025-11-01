import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Invalid topic input." },
        { status: 400 }
      );
    }

    // Simulated visual map data generation (you can later connect OpenAI here)
    const baseConcepts = [
      "Definition",
      "Key Idea",
      "Applications",
      "Examples",
      "Challenges",
      "Advantages",
      "Disadvantages",
      "Future Scope",
      "History",
      "Use Cases",
      "Terminology",
      "Concept Relation",
    ];

    // Create random node layout
    const nodes = baseConcepts.slice(0, 10).map((label, i) => ({
      id: `n${i + 1}`,
      label: `${label} of ${topic}`,
    }));

    // Simple edge generation (connects nodes in sequence)
    const edges = nodes.slice(1).map((n, i) => ({
      from: nodes[i].id,
      to: n.id,
    }));

    return NextResponse.json({ nodes, edges });
  } catch (err) {
    console.error("Error generating visual map:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
