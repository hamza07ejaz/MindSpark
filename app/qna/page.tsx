"use client";
import { useState } from "react";

export default function QnaPage() {
  const [topic, setTopic] = useState("");
  const [qna, setQna] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateQna = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first.");
      return;
    }
    setError("");
    setLoading(true);
    setQna([]);

    try {
      const res = await fetch("/api/generate-qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (data.error) {
        setError("Error generating Q&A. Try again.");
        return;
      }

      let safeQna = [];
      if (typeof data.qna === "string") {
        try {
          safeQna = JSON.parse(data.qna);
        } catch {
          safeQna = [];
        }
      } else if (Array.isArray(data.qna)) {
        safeQna = data.qna;
      }

      setQna(safeQna);
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (qna.length === 0) return;
    const formatted = qna
      .map((item, i) => `Q${i + 1}: ${item.question}\nA: ${item.answer}`)
      .join("\n\n");
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        padding: "40px 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "2.2rem",
          background: "linear-gradient(90deg, #8a2be2, #00bfff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: "bold",
          marginBottom: "25px",
          textAlign: "center",
        }}
      >
        AI Q&A Generator
      </h1>

      {/* Topic Input Bar */}
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter your topic..."
        style={{
          width: "80%",
          maxWidth: "600px",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "none",
          outline: "none",
          fontSize: "1rem",
          marginBottom: "20px",
          background: "#1a1a1a",
          color: "#fff",
          textAlign: "center",
        }}
      />

      {/* Buttons Section */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        {/* Generate Q&A */}
        <button
          onClick={handleGenerateQna}
          disabled={loading}
          style={{
            background: "linear-gradient(90deg, #007bff, #00bfff)",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            boxShadow: "0 0 15px rgba(0,191,255,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
        >
          {loading ? "Generating..." : "Generate Q&A"}
        </button>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={qna.length === 0}
          style={{
            background: "linear-gradient(90deg, #00ff88, #00bfff)",
            color: "#000",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: qna.length === 0 ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            opacity: qna.length === 0 ? 0.6 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {copied ? "Copied!" : "Copy Q&A"}
        </button>

        {/* Go Back Button */}
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            background: "linear-gradient(90deg, #ff5f6d, #ffc371)",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.transform = "scale(1)")
          }
        >
          Go Back
        </button>
      </div>

      {error && (
        <p style={{ color: "#ff4d4d", marginTop: "5px" }}>{error}</p>
      )}

      {/* Q&A Results */}
      <div
        style={{
          marginTop: "30px",
          width: "90%",
          maxWidth: "800px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        {qna.map((item, index) => (
          <div
            key={index}
            style={{
              background: "linear-gradient(135deg, #1a1a1a, #222)",
              border: "1px solid #333",
              borderRadius: "10px",
              padding: "16px 20px",
              boxShadow: "0 0 10px rgba(0,191,255,0.2)",
              transition: "transform 0.2s ease",
            }}
          >
            <p style={{ fontWeight: "bold", color: "#00bfff" }}>
              Q{index + 1}: {item.question}
            </p>
            <p style={{ marginTop: "6px", color: "#ccc" }}>
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
