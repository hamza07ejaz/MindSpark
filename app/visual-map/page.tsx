"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const ReactFlow = dynamic(() => import("reactflow").then(m => m.ReactFlow), { ssr: false });
const Background = dynamic(() => import("reactflow").then(m => m.Background), { ssr: false });
const Controls = dynamic(() => import("reactflow").then(m => m.Controls), { ssr: false });
import "reactflow/dist/style.css";

type RFNode = { id: string; data: { label: string }; position: { x: number; y: number }; style?: any };
type RFEdge = { id: string; source: string; target: string; animated?: boolean; style?: any };

export default function VisualMapPage() {
  const [topic, setTopic] = useState("");
  const [nodes, setNodes] = useState<RFNode[]>([]);
  const [edges, setEdges] = useState<RFEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // auto focus for fast UX
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasGraph = nodes.length > 0;

  const handleGenerate = async () => {
    const t = topic.trim();
    if (!t) {
      setErr("Enter a topic first.");
      return;
    }
    setErr("");
    setLoading(true);
    setNodes([]);
    setEdges([]);
    try {
      const res = await fetch("/api/generate-visual-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Failed to generate map.");
      } else {
        const n = Array.isArray(data?.nodes) ? data.nodes : [];
        const e = Array.isArray(data?.edges) ? data.edges : [];
        setNodes(n);
        setEdges(e);
      }
    } catch (e) {
      setErr("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const copyMap = async () => {
    const payload = JSON.stringify({ nodes, edges }, null, 2);
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const panelStyle = useMemo(
    () => ({
      background: "linear-gradient(135deg, #0d0d0d, #121212 60%)",
      border: "1px solid #2a2a2a",
      boxShadow: "0 0 24px rgba(147,51,234,0.18)",
      borderRadius: 16,
      padding: 16,
    }),
    []
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #050505, #0a0a0a 55%, #111 100%)",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 16px",
        gap: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1200, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "#1f2937",
            color: "#cbd5e1",
            border: "1px solid #30363d",
            padding: "10px 14px",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ fontWeight: 800, fontSize: 22, background: "linear-gradient(90deg,#ec4899,#60a5fa,#34d399)", WebkitBackgroundClip: "text", color: "transparent" }}>
          Visual Map
        </div>

        <div />
      </div>

      <div style={{ width: "100%", maxWidth: 1200, display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div style={panelStyle as React.CSSProperties}>
          <div style={{ display: "grid", gap: 10 }}>
            <label htmlFor="topic" style={{ color: "#a78bfa", fontWeight: 600 }}>
              Topic
            </label>
            <textarea
              id="topic"
              ref={inputRef}
              placeholder="Type a topic, then press Generate or use Cmd/Ctrl + Enter"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleEnter}
              style={{
                width: "100%",
                minHeight: 90,
                resize: "vertical",
                background: "#0f1115",
                color: "#f3f4f6",
                border: "1px solid #2f2f2f",
                borderRadius: 10,
                padding: 12,
                outline: "none",
              }}
            />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  background: "linear-gradient(90deg,#9333ea,#3b82f6)",
                  border: "none",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Generating…" : "Generate Map"}
              </button>

              <button
                onClick={copyMap}
                disabled={!hasGraph}
                style={{
                  background: hasGraph ? "#374151" : "#2a2a2a",
                  border: "1px solid #3a3a3a",
                  color: hasGraph ? "#e5e7eb" : "#9ca3af",
                  padding: "10px 16px",
                  borderRadius: 10,
                  cursor: hasGraph ? "pointer" : "not-allowed",
                }}
              >
                {copied ? "Copied" : "Copy Map Data"}
              </button>
            </div>

            {err && (
              <div style={{ color: "#fca5a5", fontSize: 14 }}>
                {err}
              </div>
            )}
          </div>
        </div>

        <div style={{ ...panelStyle, padding: 0 }}>
          <div style={{ height: 560, width: "100%", borderRadius: 16, overflow: "hidden" }}>
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <Background color="#6d28d9" gap={22} />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}
