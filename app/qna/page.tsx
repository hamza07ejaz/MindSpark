"use client";

import { useState } from "react";

export default function QnAPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateQnA = async () => {
    if (!input || input.trim() === "") {
      alert("Please enter a study topic");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("https://mindspark-beta.vercel.app/api/generate-qna", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: input,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        alert("Failed to generate Q&A. Please try again.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setResult(data.result || "No Q&A found.");
    } catch (error) {
      console.error("Network error:", error);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>💡 MindSpark – Generate Q&A</h1>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your study topic..."
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid gray",
          color: "black",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={handleGenerateQnA}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#555" : "#2563eb",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        {loading ? "Generating..." : "Generate Q&A"}
      </button>

      <div
        style={{
          marginTop: "40px",
          maxWidth: "700px",
          width: "100%",
          whiteSpace: "pre-wrap",
          textAlign: "left",
          lineHeight: "1.6",
        }}
      >
        {result && (
          <>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Generated Q&A:</h2>
            <p>{result}</p>
          </>
        )}
      </div>
    </div>
  );
}
