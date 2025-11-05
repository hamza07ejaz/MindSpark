"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

type Slide = { title: string; bullets: string[]; notes?: string };

const BASE_CSS = `
  *{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial}
  .deck{padding:20px}
  .slide{margin-bottom:12px}
`;

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

          {/* Replaced PowerPoint with Copy Deck Button */}
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

        {copied && (
          <div style={toast}>Copied to clipboard ✨</div>
        )}

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

/* === styles (unchanged) === */
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
const controlBar: React.CSSProperties = {
  display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18,
};
const inputBox: React.CSSProperties = {
  flex: 1, minWidth: 260, background: "linear-gradient(135deg,#111,#17171b)",
  border: "1px solid #2d2d36", color: "#e8e8f5", padding: "12px 14px",
  borderRadius: 12, outline: "none",
};
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#00ffa8,#00c7ff)", color: "#061014", fontWeight: 800,
  padding: "12px 14px", border: "none", borderRadius: 12, cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  background: "#1b1b1f", border: "1px solid #2f2f38", color: "#d6d6e9",
  padding: "12px 14px", borderRadius: 12, cursor: "pointer",
};
const toast: React.CSSProperties = {
  position: "fixed", top: 20, right: 20, background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
  color: "#000", padding: "10px 16px", borderRadius: 10, fontWeight: 700,
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transition: "opacity 0.3s ease",
};
const loaderWrap: React.CSSProperties = { display: "flex", justifyContent: "center", marginTop: 50 };
const loaderCard: React.CSSProperties = {
  width: "100%", maxWidth: 640, background: "linear-gradient(135deg,#111,#171822)",
  border: "1px solid #2a2d3a", borderRadius: 18, padding: 20, position: "relative",
  overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
};
const loaderGlow: React.CSSProperties = {
  position: "absolute", inset: 0,
  background: "radial-gradient(600px 80px at 10% -10%,rgba(118,130,255,0.25),transparent), radial-gradient(600px 80px at 90% 120%,rgba(255,110,199,0.22),transparent)",
};
const loaderStep: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginBottom: 12 };
const progressBarOuter: React.CSSProperties = {
  height: 10, background: "#20212a", borderRadius: 999, overflow: "hidden", border: "1px solid #2f3140",
};
const progressBarInner: React.CSSProperties = {
  height: "100%", background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)", transition: "width 600ms ease",
};
const loaderHint: React.CSSProperties = { marginTop: 10, color: "#a8a8c2", fontSize: 13 };
const deck: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(420px,1fr))", gap: 16,
};
const slideCard: React.CSSProperties = {
  background: "linear-gradient(135deg,#101116,#141722)", border: "1px solid #2c2f3d",
  borderRadius: 18, padding: 18, minHeight: 220, boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
};
const slideTitle: React.CSSProperties = { fontSize: 20, fontWeight: 800, marginBottom: 10 };
const slideTitleInput: React.CSSProperties = {
  ...slideTitle, background: "#0f1015", color: "#fff",
  border: "1px solid #2d3040", borderRadius: 10, padding: "10px 12px",
};
const bulletWrap: React.CSSProperties = { marginTop: 6, display: "flex", flexDirection: "column", gap: 8 };
const bulletStatic: React.CSSProperties = { fontSize: 16, color: "#e4e4f2" };
const bulletRow: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center" };
const bulletInput: React.CSSProperties = {
  flex: 1, background: "#0f1015", color: "#e9e9ff", border: "1px solid #2a2d3c", borderRadius: 10, padding: "8px 10px",
};
const chipBtn: React.CSSProperties = {
  background: "#2a2d3a", border: "1px solid #3a3d4c", color: "#dedeee", padding: "6px 10px", borderRadius: 10, cursor: "pointer",
};
const addBulletBtn: React.CSSProperties = {
  alignSelf: "flex-start", background: "#1b1c22", border: "1px solid #2e3040", color: "#cfd0e6",
  padding: "8px 10px", borderRadius: 10, cursor: "pointer",
};

Api of presentation 
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, slides = 10 } = await req.json();

    const prompt = `
You are SlideCraft, an elite slide writer. Create a JSON with exactly this shape:
{
  "slides": [
    { "title": "...", "bullets": ["...", "...", "..."], "notes": "..." }
  ]
}

Rules:
- 10–12 slides max.
- Titles short and informative.
- Bullets: concrete facts, cause→effect, definitions, examples, stats if relevant.
- No markdown symbols (#, *, -). Plain text only.
- Keep bullets punchy (5–12 words).
- First slide = title slide. Final slide = summary / next steps.
Topic: "${topic}"
`;

    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: "Respond with STRICT JSON only. No prose." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_output_tokens: 2000,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json({ error: "Upstream error", detail: txt }, { status: 500 });
    }

    const data = await resp.json();

    // The Responses API returns content in data.output[0].content[0].text for text blocks
    let raw = "";
    try {
      raw =
        data?.output?.[0]?.content?.find((c: any) => c.type === "output_text")?.text ||
        data?.output_text ||
        "";
    } catch {
      raw = "";
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      // fallback minimal
      json = {
        slides: [
          { title: topic, bullets: ["Overview", "Why it matters", "What you’ll learn"], notes: "" },
          { title: "Core Concepts", bullets: ["Concept A", "Concept B", "Concept C"], notes: "" },
        ],
      };
    }

    // hard cap & sanitize
    const clean = Array.isArray(json.slides)
      ? json.slides.slice(0, Math.min(Number(slides) || 12, 15)).map((s: any) => ({
          title: String(s?.title || "Slide"),
          bullets: Array.isArray(s?.bullets) ? s.bullets.map((b: any) => String(b)) : [],
          notes: s?.notes ? String(s.notes) : "",
        }))
      : [];

    return NextResponse.json({ slides: clean });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
