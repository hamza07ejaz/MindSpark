"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Slide = { title: string; bullets: string[]; notes?: string };

/* ---- Styles for print ---- */
const BASE_CSS = `
  *{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial}
  .deck{padding:20px}
  .slide{margin-bottom:12px}
`;
const PRINT_CSS = `
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

  // ✅ Improved PDF Export (visual)
  async function exportPDF() {
    if (!deckRef.current) return;
    const deck = deckRef.current;
    const pdf = new jsPDF("landscape", "pt", "a4");
    const slidesEls = Array.from(deck.children) as HTMLElement[];

    for (let i = 0; i < slidesEls.length; i++) {
      const canvas = await html2canvas(slidesEls[i], {
        backgroundColor: "#0d0d0d",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      if (i < slidesEls.length - 1) pdf.addPage();
    }

    pdf.save(`${(topic || "presentation").replace(/\s+/g, "_")}.pdf`);
  }

  function exportPPTX() {
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
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: "FFFFFF",
      });
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.4,
        y: 0.25,
        w: 9.2,
        h: 0.95,
        fill: { color: "1b1b1f" },
        line: { color: "3a3a44" },
      });
      const bullets = (s.bullets || []).map((b) => `• ${b}`).join("\n");
      slide.addText(bullets || " ", {
        x: 0.8,
        y: 1.4,
        w: 8.4,
        h: 4.5,
        fontSize: 18,
        color: "DDDDDD",
      });
      slide.background = { color: "0d0d0d" };
    });

    pptx.writeFile({
      fileName: `${(topic || "presentation").replace(/\s+/g, "_")}.pptx`,
    });
  }

  // ✅ Copy to Clipboard Button
  function copyPresentation() {
    if (slides.length === 0) return;
    const text = slides
      .map(
        (s, i) =>
          `Slide ${i + 1}: ${s.title}\n${s.bullets.map((b) => `• ${b}`).join("\n")}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard ✅");
  }

  return (
    <div style={page}>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.min.js"
        strategy="afterInteractive"
      />

      <div style={container}>
        <div style={header}>
          <button onClick={() => (window.location.href = "/")} style={backBtn}>
            ← Back
          </button>
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
          <button
            onClick={() => setEditing((e) => !e)}
            disabled={slides.length === 0}
            style={ghostBtn}
          >
            {editing ? "Lock Editing" : "Edit Slides"}
          </button>
          <button onClick={exportPDF} disabled={slides.length === 0} style={ghostBtn}>
            Export PDF
          </button>
          <button onClick={exportPPTX} disabled={slides.length === 0} style={ghostBtn}>
            Export PowerPoint
          </button>
          <button onClick={copyPresentation} disabled={slides.length === 0} style={ghostBtn}>
            Copy Slides
          </button>
        </div>
