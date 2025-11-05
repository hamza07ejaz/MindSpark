"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { isPremium } from "@/app/utils/isPremium"; // ✅ make sure this file exists

type Slide = { title: string; bullets: string[]; notes?: string };

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
    if (!topic.trim()) return alert("Please enter a topic.");

    setLoading(true);
    setSlides([]);

    // ✅ Check Premium
    const ok = await isPremium();
    if (!ok) {
      setLoading(false);
      alert("This is a Premium feature. Please upgrade your plan.");
      window.location.href = "/pricing";
      return;
    }

    try {
      const res = await fetch("/api/generate-presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, slides: 10 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate presentation.");
      }

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
      alert("Server Error — please try again.");
      setSlides(defaultDeck(topic));
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
      { title: "Summary", bullets: ["Key takeaways", "Next steps", "Where to go deeper"] },
    ];
  }

  function updateTitle(i: number, v: string) {
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, title: v } : s)));
  }

  function updateBullet(i: number, j: number, v: string) {
    setSlides((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? { ...s, bullets: s.bullets.map((b, k) => (k === j ? v : b)) }
          : s
      )
    );
  }

  function addBullet(i: number) {
    setSlides((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, bullets: [...s.bullets, ""] } : s
      )
    );
  }

  function removeBullet(i: number, j: number) {
    setSlides((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? { ...s, bullets: s.bullets.filter((_, k) => k !== j) }
          : s
      )
    );
  }

  function copyAll() {
    const text = slides
      .map(
        (s, i) =>
          `Slide ${i + 1}: ${s.title}\n${s.bullets.map((b) => `• ${b}`).join("\n")}`
      )
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
          <button
            onClick={() => (window.location.href = "/")}
            style={backBtn}
          >
            ← Back
          </button>
          <h1 style={title}>AI Presentation</h1>
        </div>

        <div style={controlBar}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your topic…"
            style={inputBox}
          />
          <button onClick={handleGenerate} disabled={loading} style={primaryBtn}>
            {loading ? "Generating…" : "Generate Presentation"}
          </button>
          <button
            onClick={() => setEditing((e) => !e)}
            disabled={slides.length === 0}
            style={ghostBtn}
          >
            {editing ? "Lock Editing" : "Edit Slides"}
          </button>
          <button
            onClick={copyAll}
            disabled={slides.length === 0}
            style={copyBtn}
          >
            {copied ? "Copied!" : "Copy Deck"}
          </button>
        </div>

        {loading && (
          <div style={loaderCard}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              {steps[step]}
            </div>
            <div
              style={{
                height: 10,
                width: "100%",
                background: "#222",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
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
              <div key={i} style={slideCard}>
                {editing ? (
                  <input
                    value={s.title}
                    onChange={(e) => updateTitle(i, e.target.value)}
                    style={slideTitleInput}
                  />
                ) : (
                  <div style={slideTitle}>{s.title}</div>
                )}
                <div style={{ marginTop: 6 }}>
                  {s.bullets.map((b, j) =>
                    editing ? (
                      <div key={j} style={bulletRow}>
                        <input
                          value={b}
                          onChange={(e) => updateBullet(i, j, e.target.value)}
                          style={bulletInput}
                        />
                        <button onClick={() => removeBullet(i, j)} style={chipBtn}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div key={j} style={bulletStatic}>
                        • {b}
                      </div>
                    )
                  )}
                  {editing && (
                    <button onClick={() => addBullet(i)} style={addBulletBtn}>
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

// ✅ Styles
const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#0d0d0d",
  color: "#fff",
};

const container: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: 24,
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const title: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  background: "linear-gradient(90deg,#ff6ec7,#6ea8ff,#55f2c8)",
  WebkitBackgroundClip: "text",
  color: "transparent",
  margin: 0,
};

const backBtn: React.CSSProperties = {
  background: "#1c1c1f",
  border: "1px solid #31313a",
  color: "#cfcfe6",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
};

const controlBar: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 18,
};

const inputBox: React.CSSProperties = {
  flex: 1,
  minWidth: 260,
  background: "linear-gradient(135deg,#111,#17171b)",
  border: "1px solid #2d2d36",
  color: "#e8e8f5",
  padding: "12px 14px",
  borderRadius: 12,
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#00ffa8,#00c7ff)",
  color: "#061014",
  fontWeight: 800,
  padding: "12px 14px",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  background: "#1b1b1f",
  border: "1px solid #2f2f38",
  color: "#d6d6e9",
  padding: "12px 14px",
  borderRadius: 12,
  cursor: "pointer",
};

const copyBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
  color: "#000",
  fontWeight: 800,
  padding: "12px 14px",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
};

const slideCard: React.CSSProperties = {
  background: "linear-gradient(135deg,#101116,#141722)",
  border: "1px solid #2c2f3d",
  borderRadius: 18,
  padding: 18,
  minHeight: 220,
  boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
};

const slideTitle: React.CSSProperties = { fontSize: 20, fontWeight: 800, marginBottom: 10 };
const slideTitleInput: React.CSSProperties = {
  ...slideTitle,
  background: "#0f1015",
  color: "#fff",
  border: "1px solid #2d3040",
  borderRadius: 10,
  padding: "10px 12px",
};

const bulletRow: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center" };
const bulletInput: React.CSSProperties = {
  flex: 1,
  background: "#0f1015",
  color: "#e9e9ff",
  border: "1px solid #2a2d3c",
  borderRadius: 10,
  padding: "8px 10px",
};
const chipBtn: React.CSSProperties = {
  background: "#2a2d3a",
  border: "1px solid #3a3d4c",
  color: "#dedeee",
  padding: "6px 10px",
  borderRadius: 10,
  cursor: "pointer",
};
const bulletStatic: React.CSSProperties = { fontSize: 16, color: "#e4e4f2" };
const addBulletBtn: React.CSSProperties = {
  alignSelf: "flex-start",
  background: "#1b1c22",
  border: "1px solid #2e3040",
  color: "#cfd0e6",
  padding: "8px 10px",
  borderRadius: 10,
  cursor: "pointer",
};

const loaderCard: React.CSSProperties = {
  background: "linear-gradient(135deg,#111,#171822)",
  border: "1px solid #2a2d3a",
  borderRadius: 18,
  padding: 20,
  maxWidth: 640,
  margin: "50px auto",
};
