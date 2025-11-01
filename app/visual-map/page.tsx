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

  // pan/zoom state
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // dragging nodes
  const draggingRef = useRef<{ id: string; dx: number; dy: number } | null>(
    null
  );

  // svg ref for size
  const svgRef = useRef<SVGSVGElement | null>(null);

  // simple nice layout (gridish)
  const layoutNodes = (items: APINode[]): UINode[] => {
    const cols = Math.ceil(Math.sqrt(items.length));
    const gapX = 260;
    const gapY = 180;
    const startX = 100;
    const startY = 140;
    return items.map((n, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      return {
        ...n,
        x: startX + c * gapX,
        y: startY + r * gapY,
      };
    });
  };

  const wrapLabel = (text: string, maxChars = 16, maxLines = 3): string[] => {
    const words = (text || "").split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      if ((line + " " + w).trim().length <= maxChars) {
        line = (line + " " + w).trim();
      } else {
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

  // FETCH from your existing API route
  const generate = async () => {
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

      // expect: { nodes: APINode[], edges: APIEdge[] }
      if (!Array.isArray(data?.nodes) || !Array.isArray(data?.edges)) {
        throw new Error("Bad response from generator.");
      }
      const laid = layoutNodes(data.nodes);
      setNodes(laid);
      setEdges(data.edges);
      // reset camera a bit
      setScale(1);
      setPan({ x: 40, y: 40 });
    } catch (e: any) {
      setError(e?.message || "Failed to generate map.");
    } finally {
      setLoading(false);
    }
  };

  // background pan
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
  const onBGPointerUp = (e: React.PointerEvent) => {
    isPanningRef.current = false;
  };

  // zoom on wheel
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(2.2, Math.max(0.5, scale * factor));
    setScale(newScale);
  };

  // node drag
  const onNodePointerDown = (
    e: React.PointerEvent,
    node: UINode
  ) => {
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
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: nx, y: ny } : n))
    );
  };
  const onNodePointerUp = (e: React.PointerEvent) => {
    draggingRef.current = null;
  };

  const copyData = async () => {
    const payload = {
      topic,
      nodes: nodes.map(({ id, label, details, x, y }) => ({
        id,
        label,
        details,
        x: Math.round(x),
        y: Math.round(y),
      })),
      edges,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    alert("Map data copied.");
  };

  // prettier node size based on label
  const nodeRadius = (label: string) =>
    Math.min(120, Math.max(64, 14 * Math.sqrt(label.length)));

  // compute edge lines
  const edgeLines = useMemo(() => {
    if (!nodes.length) return [];
    return edges
      .map((e) => {
        const a = findNode(e.from);
        const b = findNode(e.to);
        if (!a || !b) return null;
        return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
      })
      .filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];
  }, [nodes, edges]);

  return (
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
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto 14px auto",
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., World War 2)"
          style={{
            flex: 1,
            minWidth: 280,
            maxWidth: 700,
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            outline: "none",
            color: "#e8ebff",
            background:
              "linear-gradient(180deg, rgba(27,31,58,0.7), rgba(17,19,36,0.7))",
          }}
        />
        <button
          onClick={generate}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg,#6933ff,#22d1ee)",
            border: "none",
            padding: "10px 16px",
            borderRadius: 12,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(34,209,238,0.25)",
          }}
        >
          {loading ? "Generating…" : "Generate Map"}
        </button>
        <button
          onClick={copyData}
          disabled={!nodes.length}
          style={{
            background: "linear-gradient(135deg,#2ecc71,#20bf6b)",
            border: "none",
            padding: "10px 16px",
            borderRadius: 12,
            color: "#0b101a",
            fontWeight: 800,
            cursor: nodes.length ? "pointer" : "not-allowed",
          }}
        >
          Copy Map Data
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "#ff8c00",
            border: "none",
            padding: "10px 16px",
            borderRadius: 12,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>

      {error && (
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto 10px auto",
            color: "#ff6b6b",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          maxWidth: 1200,
          height: "72vh",
          margin: "0 auto",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          background:
            "radial-gradient(1200px 600px at 20% 0%, rgba(105,51,255,0.18), transparent 60%), radial-gradient(900px 700px at 100% 100%, rgba(34,209,238,0.12), transparent 60%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          onPointerDown={onBGPointerDown}
          onPointerMove={onBGPointerMove}
          onPointerUp={onBGPointerUp}
          style={{ touchAction: "none" }}
        >
          <defs>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={viewTransform}>
            {/* edges */}
            {edgeLines.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="rgba(150,150,255,0.35)"
                strokeWidth={2.2}
              />
            ))}

            {/* nodes */}
            {nodes.map((n) => {
              const r = nodeRadius(n.label);
              const lines = wrapLabel(n.label);
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x} ${n.y})`}
                  style={{ cursor: "grab" }}
                  onPointerDown={(e) => onNodePointerDown(e, n)}
                  onPointerMove={onNodePointerMove}
                  onPointerUp={onNodePointerUp}
                  onDoubleClick={() => setSelected(n)}
                >
                  <circle
                    r={r}
                    fill="url(#nodeGradient)"
                    filter="url(#glow)"
                    stroke="#7aa2ff"
                    strokeOpacity={0.6}
                    strokeWidth={3}
                  />
                  {/* gradient fill via separate defs for Safari stability */}
                  <defs>
                    <radialGradient id="nodeGradient" cx="35%" cy="30%">
                      <stop offset="0%" stopColor="#8a63ff" />
                      <stop offset="100%" stopColor="#5d2bd1" />
                    </radialGradient>
                  </defs>
                  {/* label */}
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      y={(i - (lines.length - 1) / 2) * 18}
                      textAnchor="middle"
                      fontSize={14}
                      fontWeight={800}
                      fill="#f3f6ff"
                      style={{
                        paintOrder: "stroke",
                        stroke: "rgba(0,0,0,0.35)",
                        strokeWidth: 3,
                      }}
                    >
                      {line}
                    </text>
                  ))}
                  {/* small hint */}
                  <text
                    y={r - 12}
                    textAnchor="middle"
                    fontSize={11}
                    fill="rgba(230,235,255,0.6)"
                  >
                    drag • double-click for details
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* details card */}
        {selected && (
          <div
            style={{
              position: "absolute",
              right: 16,
              bottom: 16,
              width: 340,
              maxWidth: "90%",
              background:
                "linear-gradient(180deg, rgba(26,30,58,0.9), rgba(16,18,34,0.9))",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
              color: "#eaf0ff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <strong style={{ fontSize: 16 }}>{selected.label}</strong>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: "transparent",
                  color: "#aab6ff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>
            <div
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "rgba(230,235,255,0.9)",
              }}
            >
              {selected.details ||
                "No extra details provided for this node."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
