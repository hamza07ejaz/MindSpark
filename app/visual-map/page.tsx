"use client";
import { useEffect, useRef, useState } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

export default function VisualMapPage() {
  const [topic, setTopic] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    drawMap();
  }, [nodes, edges]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2;

    edges.forEach((edge) => {
      const from = nodes.find((n) => n.id === edge.from);
      const to = nodes.find((n) => n.id === edge.to);
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    });

    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.fillStyle = "#9333ea";
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 3;
      ctx.arc(node.x, node.y, 45, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y + 5);
    });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Enter a topic first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate-visual-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.nodes)) {
        setError("Failed to generate visual map.");
      } else {
        const layouted: Node[] = data.nodes.map((n: any, i: number) => ({
          id: n.id || `n${i}`,
          label: n.label || `Concept ${i + 1}`,
          x: 150 + (i % 5) * 180,
          y: 150 + Math.floor(i / 5) * 150,
        }));

        const safeEdges: Edge[] =
          Array.isArray(data.edges) && data.edges.length > 0
            ? data.edges.map((e: any) => ({
                from: e.from || e.source || layouted[0]?.id || "n1",
                to: e.to || e.target || layouted[1]?.id || "n2",
              }))
            : layouted.slice(1).map((n: Node, i: number) => ({
                from: layouted[i].id,
                to: n.id,
              }));

        setNodes(layouted);
        setEdges(safeEdges);
      }
    } catch {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const copyMap = async () => {
    const payload = JSON.stringify({ topic, nodes, edges }, null, 2);
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#050505,#0a0a0a 55%,#111)",
        color: "#fff",
        fontFamily: "sans-serif",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "#1f2937",
            color: "#cbd5e1",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #30363d",
            cursor: "pointer",
          }}
        >
          ← Go Back
        </button>
        <h1
          style={{
            fontSize: "1.5rem",
            background: "linear-gradient(90deg,#ec4899,#60a5fa,#34d399)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: "bold",
          }}
        >
          Visual Map Generator
        </h1>
        <div style={{ width: "120px" }}></div>
      </div>

      <textarea
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter your topic..."
        style={{
          width: "90%",
          maxWidth: "600px",
          height: "100px",
          background: "#0f1115",
          color: "#fff",
          border: "1px solid #2a2a2a",
          borderRadius: "10px",
          padding: "10px",
          outline: "none",
          fontSize: "15px",
        }}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            background: "linear-gradient(90deg,#9333ea,#3b82f6)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Generating..." : "Generate Map"}
        </button>

        <button
          onClick={copyMap}
          disabled={!nodes.length}
          style={{
            background: nodes.length ? "#374151" : "#2a2a2a",
            color: nodes.length ? "#fff" : "#777",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: nodes.length ? "pointer" : "not-allowed",
          }}
        >
          {copied ? "Copied!" : "Copy Map Data"}
        </button>
      </div>

      {error && <p style={{ color: "#f87171" }}>{error}</p>}

      <div
        style={{
          position: "relative",
          background: "#0f0f10",
          border: "1px solid #222",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "1200px",
          height: "600px",
          marginTop: "20px",
        }}
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          style={{
            width: "100%",
            height: "100%",
            cursor: "grab",
          }}
        />
      </div>
    </main>
  );
}
