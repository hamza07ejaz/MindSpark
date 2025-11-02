"use client";
import { useState } from "react";

export default function Paraphraser() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleParaphrase = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/paraphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();
      setOutput(data.paraphrased || "No paraphrased text generated.");
    } catch (err) {
      console.error(err);
      setOutput("Error paraphrasing text.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
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
        justifyContent: "flex-start",
        fontFamily: "sans-serif",
        padding: "40px 20px",
      }}
    >
      <button
        onClick={() => (window.location.href = "/")}
        style={{
          alignSelf: "flex-start",
          marginBottom: "20px",
          background: "#1b1b1f",
          border: "1px solid #2e2e38",
          color: "#ccc",
          padding: "8px 14px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h1
        style={{
          fontSize: "28px",
          background: "linear-gradient(90deg, #27f0c8, #3aa3ff, #b575ff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          marginBottom: "25px",
        }}
      >
        Paraphrasing Tool
      </h1>

      <textarea
        placeholder="Paste or type your text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "90%",
          maxWidth: "800px",
          height: "140px",
          padding: "14px",
          background: "#111",
          border: "1px solid #333",
          borderRadius: "10px",
          color: "#fff",
          fontSize: "15px",
          marginBottom: "20px",
          outline: "none",
        }}
      />

      <button
        onClick={handleParaphrase}
        disabled={loading}
        style={{
          background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
          color: "#000",
          padding: "12px 22px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 0 18px rgba(58,163,255,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {loading ? "Paraphrasing..." : "Paraphrase Text"}
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginTop: "40px",
          width: "90%",
          maxWidth: "900px",
        }}
      >
        <div
          style={{
            background: "#111",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #333",
            height: "auto",
            minHeight: "200px",
          }}
        >
          <h3>Original Text</h3>
          <p style={{ color: "#ddd", whiteSpace: "pre-wrap" }}>{input || "Your original text will appear here."}</p>
        </div>

        <div
          style={{
            background: "#111",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #333",
            height: "auto",
            minHeight: "200px",
            position: "relative",
          }}
        >
          <h3>Paraphrased Text</h3>
          <p style={{ color: "#ddd", whiteSpace: "pre-wrap" }}>{output || "Your paraphrased text will appear here."}</p>

          {output && (
            <button
              onClick={handleCopy}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
                color: "#000",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
