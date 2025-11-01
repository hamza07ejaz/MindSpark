"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ReactFlow = dynamic(() => import("reactflow").then(m => m.ReactFlow), { ssr: false });
const Background = dynamic(() => import("reactflow").then(m => m.Background), { ssr: false });
const Controls = dynamic(() => import("reactflow").then(m => m.Controls), { ssr: false });
const MiniMap = dynamic(() => import("reactflow").then(m => m.MiniMap), { ssr: false });

export default function VisualMapPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const generateMap = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic first!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate-visual-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();

      if (data.nodes && data.nodes.length > 0) {
        const formattedNodes = data.nodes.map((n: any, i: number) => ({
          id: n.id?.toString() || `${i}`,
          data: { label: n.data?.label || `Node ${i + 1}` },
          position: n.position || { x: (i % 5) * 250, y: Math.floor(i / 5) * 200 },
          style: {
            background: "linear-gradient(135deg, #9333ea, #6d28d9)",
            color: "#fff",
            borderRadius: 10,
            border: "2px solid #a855f7",
            fontWeight: 600,
            fontSize: 15,
            textAlign: "center",
            width: 200,
            padding: "12px",
            boxShadow: "0 0 20px rgba(147,51,234,0.4)",
          },
        }));

        const formattedEdges = (data.edges || []).map((e: any, idx: number) => ({
          id: e.id || `edge-${idx}`,
          source: e.source?.toString(),
          target: e.target?.toString(),
          animated: true,
          style: { stroke: "#a855f7", strokeWidth: 2 },
        }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);
      } else {
        alert("No valid data returned from AI.");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating map.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        background: "#0d0d0d",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px",
      }}
    >
      <h1 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "10px" }}>
        AI Visual Knowledge Map
      </h1>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a study topic..."
        style={{
          width: "80%",
          maxWidth: "500px",
          padding: "12px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #a855f7",
          background: "#1a1a1a",
          color: "#fff",
          textAlign: "center",
        }}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={generateMap}
          disabled={loading}
          style={{
            background: "#8b5cf6",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {loading ? "Generating..." : "Generate Map"}
        </button>

        <button
          onClick={() =>
            navigator.clipboard.writeText(JSON.stringify({ nodes, edges }, null, 2))
          }
          style={{
            background: "#22c55e",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Copy Map Data
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "#f97316",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Go Back
        </button>
      </div>

      <div
        style={{
          width: "100%",
          height: "75vh",
          background: "#111",
          borderRadius: "12px",
          border: "1px solid #2d2d2d",
          overflow: "hidden",
        }}
      >
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#333" />
          <MiniMap nodeColor={() => "#A855F7"} />
          <Controls />
        </ReactFlow>
      </div>
    </main>
  );
}
