"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState("");
  const [qna, setQna] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateNotes = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setNotes("");
    setQna([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();
      setNotes(data.notes || "No notes generated.");
    } catch (err) {
      console.error(err);
      setNotes("Error generating notes.");
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
        padding: "20px",
      }}
    >
      <h1>🧠 MindSpark – AI Study Tool</h1>

      <textarea
        placeholder="Enter your study topic..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{
          width: "80%",
          maxWidth: "600px",
          height: "120px",
          padding: "10px",
          marginTop: "20px",
          borderRadius: "8px",
          border: "none",
          outline: "none",
        }}
      />

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* ✅ Notes Button */}
        <button
          onClick={handleGenerateNotes}
          disabled={loading}
          style={{
            background: "#00ff88",
            color: "#000",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Loading..." : "Generate Notes"}
        </button>

        {/* ✅ Q&A Button */}
        <button
          onClick={() => (window.location.href = "/qna")}
          style={{
            background: "linear-gradient(90deg, #007bff, #00bfff)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 0 15px rgba(0,191,255,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Q&A
        </button>

        {/* ✅ Flashcards Button */}
        <button
          onClick={() => (window.location.href = "/flashcards")}
          style={{
            background: "#9b59b6",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Flashcards
        </button>

        {/* ✅ Test Button */}
        <button
          onClick={() => (window.location.href = "/test")}
          style={{
            background: "#ff8c00",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Test
        </button>

        {/* ✅ Visual Map Button */}
        <button
          onClick={() => (window.location.href = "/visual-map")}
          style={{
            background: "#00ced1",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Visual Map
        </button>

        {/* ✅ Presentation Button */}
        <button
          onClick={() => (window.location.href = "/presentation")}
          style={{
            background: "linear-gradient(90deg, #ff6ec7, #6ea8ff)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 0 15px rgba(255,110,199,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Presentation
        </button>

        {/* ✅ Citation Button */}
        <button
          onClick={() => (window.location.href = "/citations")}
          style={{
            background: "linear-gradient(90deg, #27f0c8, #3aa3ff, #b575ff)",
            color: "#000",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 0 15px rgba(58,163,255,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Citations
        </button>

        {/* ✅ Grammar Button */}
        <button
          onClick={() => (window.location.href = "/grammar")}
          style={{
            background: "linear-gradient(90deg, #00ffa8, #00c7ff)",
            color: "#000",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 0 15px rgba(0,199,255,0.4)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Grammar
        </button>
      </div>

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
        {/* ✅ Paraphraser Button */}
<button
  onClick={() => (window.location.href = "/paraphraser")}
  style={{
    background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
    color: "#000",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 15px rgba(58,163,255,0.4)",
    transition: "transform 0.2s, box-shadow 0.2s",
  }}
  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
>
  Paraphraser
</button>
        <h3>📘 Notes:</h3>
        <div
          dangerouslySetInnerHTML={{
            __html: notes
              .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
              .replace(/## (.*?)\n/g, "<h3>$1</h3>")
              .replace(/\n/g, "<br/>"),
          }}
        />
      </div>
    </main>
  );
}
