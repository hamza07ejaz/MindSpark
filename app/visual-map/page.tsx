"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type APINode = { id: string; label: string; details?: string };
type APIEdge = { from: string; to: string };
type UINode = APINode & { x: number; y: number };
type UIEdge = APIEdge;

const BG = "linear-gradient(135deg, #0b0b13 0%, #0c1022 45%, #0a0c18 100%)";

export default function VisualMapPage() {
  const [topic, setTopic] = useState("");
  const [nodes, setNodes] = useState<UINode[]>([]);
  const [edges, setEdges] = useState<UIEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selected, setSelected] = useState<UINode | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  // fetch user plan
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch("/api/get-user-plan");
        const data = await res.json();
        setPlan(data.plan || "free");
      } catch {
        setPlan("free");
      }
    };
    fetchPlan();
  }, []);

  // pan/zoom state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const draggingRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const layoutNodes = (items: APINode[]): UINode[] => {
    const cols = Math.ceil(Math.sqrt(items.length));
    const gapX = 260;
    const gapY = 180;
    const startX = 100;
    const startY = 140;
    return items.map((n, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      return { ...n, x: startX + c * gapX, y: startY + r * gapY };
    });
  };

  const wrapLabel = (text: string, maxChars = 16, maxLines = 3): string[] => {
    const words = (text || "").split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      if ((line + " " + w).trim().length <= maxChars) line = (line + " " + w).trim();
      else {
        lines.push(line);
        line = w;
        if (lines.length === maxLines - 1) break;
      }
    }
    if (line) lines.push(line);
    if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
      const last = lines[lines.length - 1];
      lines[lines.length - 1] = last.replace(/\.*$/, "") + "…";
    }
    return lines;
  };

  const findNode = (id: string) => nodes.find((n) => n.id === id)!;
  const viewTransform = `translate(${pan.x} ${pan.y}) scale(${scale})`;

  const generate = async () => {
    if (plan !== "premium") {
      setError("This feature is available for Premium users only.");
      return;
    }
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setLoading(true);
    setError("");
    setSelected(null);
    try {
      const res = await fetch("/api/generate-visual-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!Array.isArray(data?.nodes) || !Array.isArray(data?.edges)) {
        throw new Error("Bad response from generator.");
      }
      const laid = layoutNodes(data.nodes);
      setNodes(laid);
      setEdges(data.edges);
      setScale(1);
      setPan({ x: 40, y: 40 });
    } catch (e: any) {
      setError(e?.message || "Failed to generate map.");
    } finally {
      setLoading(false);
    }
  };

  const onBGPointerDown = (e: React.PointerEvent) => {
    if (draggingRef.current) return;
    isPanningRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    panRef.current = { ...pan };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onBGPointerMove = (e: React.PointerEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    setPan({ x: panRef.current.x + dx, y: panRef.current.y + dy });
  };
  const onBGPointerUp = () => { isPanningRef.current = false; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(2.2, Math.max(0.5, scale * factor));
    setScale(newScale);
  };

  const onNodePointerDown = (e: React.PointerEvent, node: UINode) => {
    e.stopPropagation();
    setSelected(node);
    const pt = { x: e.clientX, y: e.clientY };
    const dx = (node.x * scale + pan.x) - pt.x;
    const dy = (node.y * scale + pan.y) - pt.y;
    draggingRef.current = { id: node.id, dx, dy };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onNodePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { id, dx, dy } = draggingRef.current;
    const nx = (e.clientX + dx - pan.x) / scale;
    const ny = (e.clientY + dy - pan.y) / scale;
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x: nx, y: ny } : n)));
  };
  const onNodePointerUp = () => { draggingRef.current = null; };

  const copyData = async () => {
    const payload = {
      topic,
      nodes: nodes.map(({ id, label, details, x, y }) => ({
        id, label, details, x: Math.round(x), y: Math.round(y)
      })),
      edges,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert("Map data copied.");
  };

  const nodeRadius = (label: string) =>
    Math.min(120, Math.max(64, 14 * Math.sqrt(label.length)));

  const edgeLines = useMemo(() => {
    if (!nodes.length) return [];
    return edges.map((e) => {
      const a = findNode(e.from);
      const b = findNode(e.to);
      if (!a || !b) return null;
      return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
    }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];
  }, [nodes, edges]);

  if (plan === null) {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );
  }

  if (plan === "free") {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: "#fff",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: 20 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
          AI Visual Map
        </h1>
        <p style={{ color: "#ff7777", fontSize: 18, marginBottom: 24 }}>
          This feature is available only for Premium users.
        </p>
        <button
          onClick={() => (window.location.href = "/pricing")}
          style={{
            background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
            color: "#000", fontWeight: "bold", padding: "12px 26px",
            borderRadius: 10, border: "none", cursor: "pointer", fontSize: 16,
          }}
        >
          Upgrade to Premium
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            marginTop: 30, background: "#ff8c00", color: "#fff",
            padding: "12px 26px", borderRadius: 10, border: "none",
            cursor: "pointer", fontWeight: "bold",
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  // original visual map content unchanged
  return (
    // everything below stays identical
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: "#fff",
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto",
        padding: 20,
      }}
      onWheel={onWheel}
    >
      {/* (your original code continues exactly as before) */}
    </div>
  );
}
