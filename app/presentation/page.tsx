"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

type Slide = { title: string; bullets: string[]; notes?: string };

const BASE_CSS = `
  *{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial}
  .deck{padding:20px}
  .slide{margin-bottom:12px}
`;
const page: React.CSSProperties = { minHeight: "100vh", background: "#0d0d0d", color: "#fff" };
export default function PresentationPage() {
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState(true);
  const [copied, setCopied] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
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
    const fetchPlan = async () => {
      try {
        const res = await fetch("/api/get-user-plan");
        const data = await res.json();
        setPlan(data.plan || "free");
      } catch {
        setPlan("free");
      }
    };
    fetchPlan();
  }, []);

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

  // ✅ Premium restriction
  if (plan === null) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );
  }

  if (plan === "free") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0d0d0d", color: "#fff",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: 20,
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
          AI Presentation Builder
        </h1>
        <p style={{ color: "#ff7777", fontSize: 18, marginBottom: 24 }}>
          This feature is available only for Premium users.
        </p>
        <button
          onClick={() => (window.location.href = "/pricing")}
          style={{
            background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
            color: "#000", fontWeight: "bold", padding: "12px 26px",
            borderRadius: 10, border: "none", cursor: "pointer", fontSize: 16,
          }}
        >
          Upgrade to Premium
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            marginTop: 30, background: "#ff8c00", color: "#fff",
            padding: "12px 26px", borderRadius: 10, border: "none",
            cursor: "pointer", fontWeight: "bold",
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  // ✅ original content below (unchanged)
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
          <button onClick={() => setEditing((e) => !e)} disabled={slides.length === 0} style={ghostBtn}>
            {editing ? "Lock Editing" : "Edit Slides"}
          </button>
          <button
            onClick={copyAll}
            disabled={slides.length === 0}
            style={{
              background: "linear-gradient(90deg,#00ffa8,#00c7ff)",
              color: "#061014",
              fontWeight: 800,
              padding: "14px 20px",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 16,
              flex: 1,
              minWidth: 220,
              boxShadow: "0 0 20px rgba(0,255,180,0.4)",
            }}
          >
            {copied ? "Copied! Paste Anywhere ✨" : "Copy Deck (Paste Anywhere)"}
          </button>
        </div>

        {copied && <div style={toast}>Copied to clipboard ✨</div>}

        {loading && (
          <div style={loaderWrap}>
            <div style={loaderCard}>
              <div style={loaderGlow} />
              <div style={loaderStep}>{steps[step]}</div>
              <div style={progressBarOuter}>
                <div style={{ ...progressBarInner, width: `${progress}%` }} />
              </div>
              <div style={loaderHint}>Please wait while we build a premium deck…</div>
            </div>
          </div>
        )}

        {!loading && slides.length > 0 && (
          <div ref={deckRef} className="deck" style={deck}>
            {slides.map((s, i) => (
              <div key={i} className="slide" style={slideCard}>
                {editing ? (
                  <input
                    value={s.title}
                    onChange={(e) => updateTitle(i, e.target.value)}
                    style={slideTitleInput}
                  />
                ) : (
                  <div style={slideTitle}>{s.title}</div>
                )}
                <div style={bulletWrap}>
                  {s.bullets.map((b, j) =>
                    editing ? (
                      <div key={j} style={bulletRow}>
                        <input
                          value={b}
                          onChange={(e) => updateBullet(i, j, e.target.value)}
                          style={bulletInput}
                        />
                        <button onClick={() => removeBullet(i, j)} style={chipBtn}>✕</button>
                      </div>
                    ) : (
                      <div key={j} style={bulletStatic}>• {b}</div>
                    )
                  )}
                  {editing && <button onClick={() => addBullet(i)} style={addBulletBtn}>+ Add bullet</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`html,body{background:#0d0d0d}`}</style>
    </div>
  );
}

/* === your styles stay identical below === */
