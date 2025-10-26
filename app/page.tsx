"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();
      setResult(data.notes || "No notes generated.");
    } catch (error) {
      console.error(error);
      setResult("Error generating notes.");
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
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h1>🧠 MindSpark – AI Notes Generator</h1>
      <textarea
        placeholder="Enter your study text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "80%",
          maxWidth: "600px",
          height: "150px",
          padding: "10px",
          marginTop: "20px",
          borderRadius: "8px",
          border: "none",
          outline: "none",
        }}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          marginTop: "15px",
          background: "#00ff88",
          color: "#000",
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {loading ? "Generating..." : "Generate Notes"}
      </button>

      <div
        style={{
          marginTop: "30px",
          width: "80%",
          maxWidth: "600px",
          background: "#111",
          padding: "20px",
          borderRadius: "8px",
          whiteSpace: "pre-wrap",
        }}
      >
        <h3>📘 AI Notes:</h3>
        <p>{result}</p>
      </div>
    </main>
  );
} 