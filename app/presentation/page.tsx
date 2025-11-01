"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";

type Slide = { title: string; bullets: string[]; notes?: string };

export default function PresentationPage() {
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState(true);
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
        // sanitize/normalize minimal
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
      {
        title: "Core Concepts",
        bullets: ["Concept A", "Concept B", "Concept C"],
      },
      {
        title: "How It Works",
        bullets: ["Step 1", "Step 2", "Step 3"],
      },
      {
        title: "Real-World Impact",
        bullets: ["Use case 1", "Use case 2", "Use case 3"],
      },
      {
        title: "Pros & Cons",
        bullets: ["Advantages", "Limitations", "Trade-offs"],
      },
      {
        title: "Key Terms",
        bullets: ["Term 1 — definition", "Term 2 — definition", "Term 3 — definition"],
      },
      {
        title: "Cause & Effect",
        bullets: ["Cause → Effect 1", "Cause → Effect 2", "Cause → Effect 3"],
      },
      {
        title: "Important Figures/Dates",
        bullets: ["Figure/Date 1", "Figure/Date 2", "Figure/Date 3"],
      },
      {
        title: "Common Mistakes",
        bullets: ["Mistake 1", "Mistake 2", "Mistake 3"],
      },
      {
        title: "Summary & Next Steps",
        bullets: ["Key takeaways", "What to review", "Where to go deeper"],
      },
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

  function exportPDF() {
    // print the deck area only
    if (!deckRef.current) return;
    const printCss = `
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .no-print { display: none !important; }
        .deck { width: 100% !important; }
        .slide {
          page-break-after: always;
          break-after: page;
          box-shadow: none !important;
        }
      }
    `;
    const w = window.open("", "_blank", "width=1200,height=800");
    if (!w) return;
    w.document.write(`<html><head><title>${topic}</title><style>${baseCss}</style><style>${printCss}</style></head><body>${deckRef.current.outerHTML}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  function exportPPTX() {
    // Uses PptxGenJS injected by CDN script below
    const anyWin = window as any;
    if (!anyWin.PptxGenJS) {
      alert("Export module not loaded yet. Please try again in a moment.");
      return;
    }
    const pptx = new anyWin.PptxGenJS();
    pptx.layout = "16x9";

    slides.forEach((s) => {
      const slide = pptx.addSlide();
      slide.addText(s.title || "Slide", {
        x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 28, bold: true, color: "FFFFFF",
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.4, y: 0.25, w: 9.2, h: 0.95, fill: { color: "1b1b1f" }, line: { color: "3a3a44" },
      });
      const bullets = (s.bullets || []).map((b) => `• ${b}`).join("\n");
      slide.addText(bullets || " ", {
        x: 0.8, y: 1.4, w: 8.4, h: 4.5, fontSize: 18, color: "DDDDDD",
      });
      slide.background = { color: "0d0d0d" };
    });

    pptx.writeFile({ fileName: `${(topic || "presentation").replace(/\s+/g, "_")}.pptx` });
  }

  return (
    <div style={page}>
      {/* PptxGenJS via CDN (no package.json changes) */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.min.js"
        strategy="afterInteractive"
      />

      <div style={container}>
        <div style={header}>
          <button onClick={() => (window.location.href = "/")} style={backBtn}>← Back</button>
          <h1 style={title}>AI Presentation</h1>
          <div className="no-print" />
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
          <button onClick={exportPDF} disabled={slides.length === 0} style={ghostBtn}>Export PDF</button>
          <button onClick={exportPPTX} disabled={slides.length === 0} style={ghostBtn}>Export PowerPoint</button>
        </div>

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
                  {editing && (
                    <button onClick={() => addBullet(i)} style={addBulletBtn}>+ Add bullet</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print/Screen base CSS */}
      <style>{`html,body{background:#0d0d0d}`}</style>
    </div>
  );
}

/* ============ Inline Styles (no Tailwind needed) ============ */
const page: React.CSSProperties = { minHeight: "100vh", background: "#0d0d0d", color: "#fff" };
const container: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "24px" };
const header: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 };
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
  display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18,
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

const loaderWrap: React.CSSProperties = { display: "flex", justifyContent: "center", marginTop: 50 };
const loaderCard: React.CSSProperties = {
  width: "100%",
  maxWidth: 640,
  background: "linear-gradient(135deg,#111,#171822)",
  border: "1px solid #2a2d3a",
  borderRadius: 18,
  padding: 20,
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
};
const loaderGlow: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(600px 80px at 10% -10%,rgba(118,130,255,0.25),transparent), radial-gradient(600px 80px at 90% 120%,rgba(255,110,199,0.22),transparent)",
  pointerEvents: "none",
};
const loaderStep: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginBottom: 12 };
const progressBarOuter: React.CSSProperties = {
  height: 10, background: "#20212a", borderRadius: 999, overflow: "hidden", border: "1px solid #2f3140",
};
const progressBarInner: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
  transition: "width 600ms ease",
};
const loaderHint: React.CSSProperties = { marginTop: 10, color: "#a8a8c2", fontSize: 13 };

const deck: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(420px,1fr))",
  gap: 16,
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
const bulletWrap: React.CSSProperties = { marginTop: 6, display: "flex", flexDirection: "column", gap: 8 };
const bulletStatic: React.CSSProperties = { fontSize: 16, color: "#e4e4f2" };
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
const addBulletBtn: React.CSSProperties = {
  alignSelf: "flex-start",
  background: "#1b1c22",
  border: "1px solid #2e3040",
  color: "#cfd0e6",
  padding: "8px 10px",
  borderRadius: 10,
  cursor: "pointer",
};

const baseCss = `
  *{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial}
  .deck{padding:20px}
  .slide{margin-bottom:12px}
`;
