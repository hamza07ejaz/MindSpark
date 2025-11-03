"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateNotes = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setNotes("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      setNotes(data.notes || "No notes generated.");
    } catch {
      setNotes("Error generating notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        background: "radial-gradient(circle at 20% 20%, #0b0b0f, #050507)",
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          background: "linear-gradient(90deg, #27f0c8, #3aa3ff, #b575ff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          fontWeight: "800",
          marginBottom: "10px",
        }}
      >
        MindSpark AI
      </h1>

      <p style={{ color: "#b5b5c8", marginBottom: "30px", fontSize: "18px" }}>
        All-in-one study intelligence for notes, flashcards, Q&A, and more.
      </p>

      <div
        style={{
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "25px",
          maxWidth: "700px",
          width: "100%",
          boxShadow: "0 0 30px rgba(0,0,0,0.25)",
        }}
      >
        <textarea
          placeholder="Enter your topic or question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: "100%",
            height: "130px",
            padding: "15px",
            borderRadius: "14px",
            border: "1px solid #24242e",
            background: "rgba(15,15,20,0.7)",
            color: "#fff",
            fontSize: "16px",
            outline: "none",
            resize: "none",
          }}
        />

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {[
            { name: "Generate Notes", color: "linear-gradient(90deg,#00ffa8,#00c7ff)", action: handleGenerateNotes },
            { name: "Q&A", color: "linear-gradient(90deg,#007bff,#00bfff)", link: "/qna" },
            { name: "Flashcards", color: "linear-gradient(90deg,#a56eff,#9b59b6)", link: "/flashcards" },
            { name: "Test", color: "linear-gradient(90deg,#ff8c00,#ffb347)", link: "/test" },
            { name: "Visual Map", color: "linear-gradient(90deg,#00ced1,#00e0ff)", link: "/visual-map" },
            { name: "Presentation", color: "linear-gradient(90deg,#ff6ec7,#6ea8ff)", link: "/presentation" },
            { name: "Citations", color: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)", link: "/citations" },
            { name: "Grammar", color: "linear-gradient(90deg,#00ffa8,#00c7ff)", link: "/grammar" },
            { name: "Paraphrasing", color: "linear-gradient(90deg,#ff4ec7,#ff8c00)", link: "/paraphrase" },
            { name: "Career Help", color: "linear-gradient(90deg,#6ea8ff,#55f2c8)", link: "/career" },
            { name: "Study Plan", color: "linear-gradient(90deg,#ff9a9e,#fad0c4)", link: "/study-plan" },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={() =>
                btn.link
                  ? (window.location.href = btn.link)
                  : btn.action?.()
              }
              disabled={loading && btn.name === "Generate Notes"}
              style={{
                background: btn.color,
                color: "#000",
                padding: "12px 22px",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(255,255,255,0.15)",
                transition: "all 0.25s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {loading && btn.name === "Generate Notes" ? "Loading..." : btn.name}
            </button>
          ))}
        </div>
      </div>

      {notes && (
        <div
          style={{
            marginTop: "40px",
            background: "rgba(255,255,255,0.05)",
            padding: "25px",
            borderRadius: "14px",
            maxWidth: "700px",
            width: "100%",
            textAlign: "left",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 25px rgba(0,0,0,0.25)",
          }}
        >
          <h3
            style={{
              background: "linear-gradient(90deg,#00ffa8,#00c7ff)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              fontWeight: "800",
              marginBottom: "12px",
            }}
          >
            Notes
          </h3>
          <div
            dangerouslySetInnerHTML={{
              __html: notes
                .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                .replace(/## (.*?)\n/g, "<h3>$1</h3>")
                .replace(/\n/g, "<br/>"),
            }}
          />
        </div>
      )}
    </main>
  );
}
