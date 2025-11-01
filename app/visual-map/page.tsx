"use client";

import { useState } from "react";

export default function VisualMapPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState<any[]>([]);

  const generateMap = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
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
      if (data && data.concepts && data.concepts.length > 0) {
        setMapData(data.concepts);
      } else {
        alert("No information found for this topic.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating map.");
    } finally {
      setLoading(false);
    }
  };

  const getPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 220 + Math.floor(index / 8) * 130;
    return {
      x: 500 + radius * Math.cos(angle),
      y: 350 + radius * Math.sin(angle),
    };
  };

  return (
    <main
      style={{
        background: "#0d0d0d",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 15 }}>
        AI Visual Knowledge Map Generator
      </h1>

      <input
        placeholder="Enter a topic (e.g. World War 2)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{
          width: "80%",
          maxWidth: 500,
          padding: "12px",
          borderRadius: 8,
          background: "#1a1a1a",
          color: "#fff",
          border: "1px solid #9333ea",
          textAlign: "center",
        }}
      />

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button
          onClick={generateMap}
          disabled={loading}
          style={{
            background: "#8b5cf6",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {loading ? "Generating..." : "Generate Map"}
        </button>

        <button
          onClick={() => navigator.clipboard.writeText(JSON.stringify(mapData, null, 2))}
          style={{
            background: "#22c55e",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 8,
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
            borderRadius: 8,
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
          marginTop: "40px",
          width: "95%",
          height: "70vh",
          background: "radial-gradient(circle at center, #111 0%, #000 100%)",
          borderRadius: 12,
          position: "relative",
          overflow: "hidden",
          border: "1px solid #222",
        }}
      >
        {mapData.length > 0 ? (
          <svg width="100%" height="100%">
            {mapData.map((item: any, i: number) => {
              const { x, y } = getPosition(i, mapData.length);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="80" fill="url(#grad)" stroke="#9333ea" strokeWidth="3" />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    dy=".3em"
                    style={{ pointerEvents: "none" }}
                  >
                    {item.title.length > 18
                      ? item.title.slice(0, 18) + "..."
                      : item.title}
                  </text>
                </g>
              );
            })}
            <defs>
              <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6b21a8" />
              </radialGradient>
            </defs>
          </svg>
        ) : (
          <p style={{ textAlign: "center", marginTop: "200px", color: "#aaa" }}>
            Enter a topic above and click "Generate Map" to see your AI visual map.
          </p>
        )}
      </div>
    </main>
  );
}
