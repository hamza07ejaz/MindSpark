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

  // ✅ Fixed Export PowerPoint Function
  function exportPPTX() {
    const anyWin = window as any;
    if (!anyWin.pptxReady || !anyWin.PptxGenJS) {
      alert("Please wait a second — preparing export engine...");
      setTimeout(exportPPTX, 1000);
      return;
    }

    const pptx = new anyWin.PptxGenJS();
    pptx.layout = "16x9";

    slides.forEach((s) => {
      const slide = pptx.addSlide();
      slide.background = { color: "0d0d0d" };
      slide.addText(s.title || "Slide", {
        x: 0.5, y: 0.4, w: 9, h: 0.8, fontSize: 30, bold: true, color: "FFFFFF",
      });
      const bullets = (s.bullets || []).map((b) => `• ${b}`).join("\n");
      slide.addText(bullets || " ", {
        x: 1, y: 1.5, w: 8, h: 4.5, fontSize: 18, color: "DDDDDD",
      });
    });

    pptx.writeFile({ fileName: `${(topic || "presentation").replace(/\s+/g, "_")}.pptx` });
  }

  return (
    <div style={page}>
      {/* ✅ Load PptxGenJS instantly and mark as ready */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log("✅ PptxGenJS loaded successfully");
          (window as any).pptxReady = true;
        }}
        onError={(e) => console.error("⚠️ PptxGenJS failed to load", e)}
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

      <style>{`html,body{background:#0d0d0d}`}</style>
    </div>
  );
}
