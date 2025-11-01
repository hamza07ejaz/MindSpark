"use client";

import { useState } from "react";

export default function QnAPage() {
  const [input, setInput] = useState("");
  const [qna, setQna] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateQnA = async () => {
    if (!input || input.trim() === "") {
      alert("Please enter a topic first!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/generate-qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: input }),
      });

      const data = await response.json();

      if (response.ok) {
        setQna(data.result);
      } else {
        console.error("Error:", data.error);
        alert("Failed to generate Q&A. Please try again.");
      }
    } catch (error) {
      console.error("QnA generation error:", error);
      alert("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #000000, #0f2027)",
        color: "white",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        MindSpark – AI Q&A Generator
      </h1>

      <input
        type="text"
        placeholder="Enter your study topic..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          marginBottom: "20px",
          fontSize: "1rem",
        }}
      />

      <button
        onClick={handleGenerateQnA}
        disabled={loading}
        style={{
          backgroundColor: "#0070f3",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
          marginBottom: "30px",
        }}
      >
        {loading ? "Generating..." : "Generate Q&A"}
      </button>

      {qna && (
        <div
          style={{
            width: "100%",
            maxWidth: "700px",
            backgroundColor: "#111",
            padding: "20px",
            borderRadius: "10px",
            whiteSpace: "pre-wrap",
            fontSize: "1rem",
            lineHeight: "1.5",
          }}
        >
          {qna}
        </div>
      )}
    </div>
  );
}
