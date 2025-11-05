"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

type Slide = { title: string; bullets: string[]; notes?: string };

// ✅ Move these constants ABOVE component so TS finds them
const page: React.CSSProperties = { minHeight: "100vh", background: "#0d0d0d", color: "#fff" };
const container: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "24px" };
const header: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 };
const title: React.CSSProperties = {
  fontSize: 26, fontWeight: 800,
  background: "linear-gradient(90deg,#ff6ec7,#6ea8ff,#55f2c8)",
  WebkitBackgroundClip: "text", color: "transparent", margin: 0,
};
const backBtn: React.CSSProperties = {
  background: "#1c1c1f", border: "1px solid #31313a", color: "#cfcfe6",
  padding: "8px 12px", borderRadius: 10, cursor: "pointer",
};

export default function PresentationPage() {
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState(true);
  const [copied, setCopied] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(
    () => [
      "Crafting your outline…",
      "Summarizing key insights…",
      "Designing slide flow…",
      "Polishing speaker notes…",
      "Finalizing your deck…",
    ],
    []
  );

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => (s + 1 < steps.length ? s + 1 : s));
    }, 1200);
    return () => clearInterval(id);
  }, [loading, steps.length]);

  const progress = Math.round(((step + 1) / steps.length) * 100);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setSlides([]);
    try {
      const res = await fetch("/api/generate-presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, slides: 10 }),
      });
      const data = await res.json();
      if (Array.isArray(data.slides)) {
        const clean = data.slides
          .map((s: any) => ({
            title: String(s.title || "Slide"),
            bullets: Array.isArray(s.bullets)
              ? s.bullets.map((b: any) => String(b))
              : [],
            notes: s.notes ? String(s.notes) : "",
          }))
          .slice(0, 15);
        setSlides(clean.length ? clean : defaultDeck(topic));
      } else {
        setSlides(defaultDeck(topic));
      }
      setEditing(true);
    } catch (e) {
      console.error(e);
      setSlides(defaultDeck(topic));
      setEditing(true);
    } finally {
      setLoading(false);
    }
  }

  function defaultDeck(t: string): Slide[] {
    return [
      { title: t, bullets: ["Overview", "Why it matters", "What you’ll learn"] },
      { title: "Core Concepts", bullets: ["Concept A", "Concept B", "Concept C"] },
      { title: "How It Works", bullets: ["Step 1", "Step 2", "Step 3"] },
      { title: "Real-World Impact", bullets: ["Use case 1", "Use case 2", "Use case 3"] },
      { title: "Pros & Cons", bullets: ["Advantages", "Limitations", "Trade-offs"] },
      { title: "Key Terms", bullets: ["Term 1 — definition", "Term 2 — definition", "Term 3 — definition"] },
      { title: "Cause & Effect", bullets: ["Cause → Effect 1", "Cause → Effect 2", "Cause → Effect 3"] },
      { title: "Important Figures/Dates", bullets: ["Figure/Date 1", "Figure/Date 2", "Figure/Date 3"] },
      { title: "Common Mistakes", bullets: ["Mistake 1", "Mistake 2", "Mistake 3"] },
      { title: "Summary & Next Steps", bullets: ["Key takeaways", "What to review", "Where to go deeper"] },
    ];
  }

  function updateTitle(i: number, v: string) {
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, title: v } : s)));
  }
  function updateBullet(i: number, j: number, v: string) {
    setSlides((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, bullets: s.bullets.map((b, k) => (k === j ? v : b)) } : s
      )
    );
  }
  function addBullet(i: number) {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, bullets: [...s.bullets, ""] } : s))
    );
  }
  function removeBullet(i: number, j: number) {
    setSlides((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, bullets: s.bullets.filter((_, k) => k !== j) } : s
      )
    );
  }

  function copyAll() {
    const text = slides
      .map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.bullets.map((b) => `• ${b}`).join("\n")}`)
      .join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={page}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.min.js"
        strategy="afterInteractive"
      />

      <div style={container}>
        <div style={header}>
          <button onClick={() => (window.location.href = "/")} style={backBtn}>← Back</button>
          <h1 style={title}>AI Presentation</h1>
        </div>

        <div style={{
          display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18,
        }}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your topic…"
            style={{
              flex: 1, minWidth: 260, background: "linear-gradient(135deg,#111,#17171b)",
              border: "1px solid #2d2d36", color: "#e8e8f5", padding: "12px 14px",
              borderRadius: 12, outline: "none",
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              background: "linear-gradient(90deg,#00ffa8,#00c7ff)",
              color: "#061014", fontWeight: 800,
              padding: "12px 14px", border: "none", borderRadius: 12, cursor: "pointer",
            }}
          >
            {loading ? "Generating…" : "Generate Presentation"}
          </button>
          <button
            onClick={() => setEditing((e) => !e)}
            disabled={slides.length === 0}
            style={{
              background: "#1b1b1f", border: "1px solid #2f2f38", color: "#d6d6e9",
              padding: "12px 14px", borderRadius: 12, cursor: "pointer",
            }}
          >
            {editing ? "Lock Editing" : "Edit Slides"}
          </button>
          <button
            onClick={copyAll}
            disabled={slides.length === 0}
            style={{
              background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
              color: "#000", fontWeight: 800, padding: "12px 14px",
              border: "none", borderRadius: 12, cursor: "pointer",
            }}
          >
            {copied ? "Copied!" : "Copy Deck"}
          </button>
        </div>

        {loading && (
          <p style={{ color: "#ccc", marginTop: 20 }}>Generating your slides...</p>
        )}

        {!loading && slides.length > 0 && (
          <div
            ref={deckRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(420px,1fr))",
              gap: 16,
            }}
          >
            {slides.map((s, i) => (
              <div
                key={i}
                style={{
                  background: "linear-gradient(135deg,#101116,#141722)",
                  border: "1px solid #2c2f3d",
                  borderRadius: 18,
                  padding: 18,
                  minHeight: 220,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
                }}
              >
                {editing ? (
                  <input
                    value={s.title}
                    onChange={(e) => updateTitle(i, e.target.value)}
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      marginBottom: 10,
                      background: "#0f1015",
                      color: "#fff",
                      border: "1px solid #2d3040",
                      borderRadius: 10,
                      padding: "10px 12px",
                      width: "100%",
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>{s.title}</div>
                )}
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.bullets.map((b, j) =>
                    editing ? (
                      <div key={j} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          value={b}
                          onChange={(e) => updateBullet(i, j, e.target.value)}
                          style={{
                            flex: 1,
                            background: "#0f1015",
                            color: "#e9e9ff",
                            border: "1px solid #2a2d3c",
                            borderRadius: 10,
                            padding: "8px 10px",
                          }}
                        />
                        <button
                          onClick={() => removeBullet(i, j)}
                          style={{
                            background: "#2a2d3a",
                            border: "1px solid #3a3d4c",
                            color: "#dedeee",
                            padding: "6px 10px",
                            borderRadius: 10,
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div key={j} style={{ fontSize: 16, color: "#e4e4f2" }}>• {b}</div>
                    )
                  )}
                  {editing && (
                    <button
                      onClick={() => addBullet(i)}
                      style={{
                        alignSelf: "flex-start",
                        background: "#1b1c22",
                        border: "1px solid #2e3040",
                        color: "#cfd0e6",
                        padding: "8px 10px",
                        borderRadius: 10,
                        cursor: "pointer",
                      }}
                    >
                      + Add bullet
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
