import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "Invalid topic" }, { status: 400 });
    }

    // call OpenAI without adding any new libraries
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You generate clean concept maps. Return ONLY compact JSON: {\"nodes\":[{\"id\":\"n1\",\"label\":\"...\"}],\"edges\":[{\"source\":\"n1\",\"target\":\"n2\"}]}. 10-15 nodes. Include main concept, key ideas, definitions, relationships. No code fences. No extra text.",
          },
          {
            role: "user",
            content: `Make a clear concept map for: ${topic}`,
          },
        ],
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      return NextResponse.json({ error: "OpenAI error", detail: t }, { status: 500 });
    }

    const json = await resp.json();
    let content = json?.choices?.[0]?.message?.content || "{}";

    // strip code fences if any
    content = content.replace(/^```json/gi, "").replace(/^```/gi, "").replace(/```$/g, "");

    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { nodes: [], edges: [] };
    }

    const rawNodes: any[] = Array.isArray(parsed?.nodes) ? parsed.nodes.slice(0, 15) : [];
    const rawEdges: any[] = Array.isArray(parsed?.edges) ? parsed.edges : [];

    // build React Flow nodes with styling and random layout
    const width = 900;
    const height = 500;

    const rfNodes = rawNodes.map((n, i) => {
      const id = String(n?.id ?? `n${i + 1}`);
      const label = String(n?.label ?? `Concept ${i + 1}`);
      const x = Math.round(Math.random() * (width - 120)) + 40;
      const y = Math.round(Math.random() * (height - 120)) + 40;

      return {
        id,
        data: { label },
        position: { x, y },
        style: {
          background: "linear-gradient(135deg,#9333ea 0%, #3b82f6 100%)",
          color: "#fff",
          borderRadius: 12,
          padding: 10,
          fontWeight: 700,
          boxShadow: "0 0 18px rgba(147,51,234,0.35)",
        },
      };
    });

    // ensure valid ids exist
    const idSet = new Set(rfNodes.map((n: any) => n.id));
    const rfEdges = rawEdges
      .map((e, i) => {
        const source = String(e?.source ?? rfNodes[0]?.id ?? "n1");
        const target = String(e?.target ?? rfNodes[1]?.id ?? "n2");
        if (!idSet.has(source) || !idSet.has(target) || source === target) return null;
        return {
          id: `e${i + 1}`,
          source,
          target,
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
        };
      })
      .filter(Boolean) as RFEdge[];

    // if no edges came back, create a simple chain so it always renders nicely
    if (rfEdges.length === 0 && rfNodes.length > 1) {
      for (let i = 0; i < rfNodes.length - 1; i++) {
        rfEdges.push({
          id: `auto-${i}`,
          source: rfNodes[i].id,
          target: rfNodes[i + 1].id,
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
        });
      }
    }

    return NextResponse.json({ nodes: rfNodes, edges: rfEdges });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate visual map" }, { status: 500 });
  }
}
