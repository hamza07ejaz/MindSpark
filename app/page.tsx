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

  const handleGenerateQna = async () => {
    if (!notes.trim()) return alert("Generate notes first!");
    setLoading(true);
    setQna([]);

    try {
      const res = await fetch("/api/generate-qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      const data = await res.json();

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
      setQna([]);
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

        <button
          onClick={handleGenerateQna}
          disabled={loading}
          style={{
            background: "#0088ff",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Loading..." : "Generate Q&A"}
        </button>

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

        {/* ✅ New Visual Map Button */}
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
        <h3>📘 Notes:</h3>
        <div
          dangerouslySetInnerHTML={{
            __html: notes
              .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
              .replace(/## (.*?)\n/g, "<h3>$1</h3>")
              .replace(/\n/g, "<br/>"),
          }}
        />

        {qna.length > 0 && (
          <>
            <h3 style={{ marginTop: "20px" }}>❓ Quiz:</h3>
            {qna.map((item, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <p>
                  <strong>Q{i + 1}:</strong> {item.question}
                </p>
                <p>
                  <strong>Answer:</strong> {item.answer}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
