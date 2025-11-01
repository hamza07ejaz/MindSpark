"use client";

import React, { useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

export default function VisualMapPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const generateMap = async () => {
    if (!topic.trim()) return alert("Please enter a topic first!");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-visual-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();

      if (data.nodes && data.nodes.length > 0) {
        const cleanNodes = data.nodes.map((n: any) => ({
          id: n.id?.toString(),
          data: { label: n.data?.label || "No label" },
          position: n.position || { x: 0, y: 0 },
          style: {
            background: "linear-gradient(145deg,#2a0a59,#4b0082)",
            color: "#fff",
            border: "2px solid #a855f7",
            borderRadius: 12,
            padding: 12,
            fontWeight: 600,
            width: 220,
            textAlign: "center",
            fontSize: "14px",
          },
        }));

        const cleanEdges = (data.edges || []).map((e: any, i: number) => ({
          id: e.id || `edge-${i}`,
          source: e.source?.toString(),
          target: e.target?.toString(),
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
        }));

        setNodes(cleanNodes);
        setEdges(cleanEdges);
      } else {
        alert("No map data found. Try again.");
      }
    } catch (err) {
      console.error(err);
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
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
        Visual Knowledge Map Generator
      </h1>

      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter any topic (e.g. Climate Change)"
        style={{
          padding: 12,
          width: "80%",
          maxWidth: 500,
          borderRadius: 8,
          border: "1px solid #a855f7",
          background: "#1a1a1a",
          color: "#fff",
          marginBottom: 15,
          textAlign: "center",
        }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={generateMap}
          disabled={loading}
          style={{
            background: "#8b5cf6",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "Generating..." : "Generate Map"}
        </button>

        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify({ nodes, edges }, null, 2))}
          style={{
            background: "#22c55e",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
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
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>

      <div
        style={{
          width: "100%",
          height: "75vh",
          background: "#1a1a1a",
          borderRadius: 16,
          border: "1px solid #2d2d2d",
          overflow: "hidden",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#3b3b3b" />
          <MiniMap nodeColor={() => "#8b5cf6"} />
          <Controls />
        </ReactFlow>
      </div>
    </main>
  );
}
