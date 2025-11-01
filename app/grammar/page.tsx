"use client";
import { useEffect, useMemo, useState } from "react";

type Tone = "Academic" | "Professional" | "Casual";

export default function GrammarPage() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<Tone>("Academic");
  const [fixed, setFixed] = useState("");
  const [changes, setChanges] = useState<Array<{ from: string; to: string; reason: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);

  const steps = useMemo(
    () => [
      "Analyzing grammar and punctuation",
      "Improving clarity and concision",
      "Adapting tone and formality",
      "Final review and polish",
    ],
    []
  );
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const id = setInterval(() => setStep((s) => (s + 1 < steps.length ? s + 1 : s)), 900);
    return () => clearInterval(id);
  }, [loading, steps.length]);

  async function fixGrammar() {
    if (!text.trim()) return;
    setLoading(true);
    setFixed("");
    setChanges([]);
    try {
      const res = await fetch("/api/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone }),
      });
      const data = await res.json();
      if (data?.corrected) setFixed(String(data.corrected));
      if (Array.isArray(data?.changes)) setChanges(data.changes);
      if (!data?.corrected) setFixed(text);
    } catch {
      setFixed(text);
      setChanges([]);
    } finally {
      setLoading(false);
    }
  }

  function copyFixed() {
    if (!fixed) return;
    navigator.clipboard.writeText(fixed).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  async function pasteFromClipboard() {
    try {
      const t = await navigator.clipboard.readText();
      if (t) {
        setText(t);
        setPasted(true);
        setTimeout(() => setPasted(false), 1200);
      }
    } catch {
      // ignore
    }
  }

  const progress = Math.round(((step + 1) / steps.length) * 100);

  return (
    <main style={page}>
      <div style={wrap}>
        <div style={header}>
          <button onClick={() => (window.location.href = "/")} style={backBtn}>← Back</button>
          <h1 style={title}>AI Grammar</h1>
          <div />
        </div>

        <div style={row}>
          <div style={inputCol}>
            <div style={labelRow}>
              <span>Enter text</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={pasteFromClipboard} style={miniBtn}>Paste</button>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  style={selectBox}
                >
                  <option>Academic</option>
                  <option>Professional</option>
                  <option>Casual</option>
                </select>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here"
              style={textarea}
            />
            <button onClick={fixGrammar} disabled={loading || !text.trim()} style={primaryBtn}>
              {loading ? "Fixing…" : "Fix Grammar"}
            </button>
            {pasted && <div style={toastOk}>Pasted</div>}
          </div>

          <div style={outputCol}>
            <div style={labelRow}>
              <span>Corrected output</span>
              <button onClick={copyFixed} disabled={!fixed} style={miniBtn}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div style={outputBox}>
              {loading ? (
                <div style={loaderCard}>
                  <div style={loaderGlow} />
                  <div style={loaderStep}>{steps[step]}</div>
                  <div style={progressOuter}><div style={{ ...progressInner, width: `${progress}%` }} /></div>
                  <div style={loaderHint}>Polishing your writing</div>
                </div>
              ) : fixed ? (
                <pre style={pre}>{fixed}</pre>
              ) : (
                <div style={placeholder}>Your improved text will appear here</div>
              )}
            </div>

            {changes.length > 0 && (
              <div style={changesBox}>
                <div style={changesTitle}>What changed</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {changes.map((c, i) => (
                    <div key={i} style={changeRow}>
                      <div style={chipBad}>{c.from}</div>
                      <div style={{ opacity: 0.6 }}>→</div>
                      <div style={chipGood}>{c.to}</div>
                      {c.reason && <div style={reason}>{c.reason}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`html,body{background:#0d0d0d}`}</style>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", color: "#fff", background: "#0d0d0d", fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial" };
const wrap: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: 24 };
const header: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 };
const title: React.CSSProperties = { margin: 0, fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg,#ff6ec7,#6ea8ff,#55f2c8)", WebkitBackgroundClip: "text", color: "transparent" };
const backBtn: React.CSSProperties = { background: "#1b1b1f", border: "1px solid #2f2f38", color: "#d6d6e9", padding: "8px 12px", borderRadius: 10, cursor: "pointer" };
const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const inputCol: React.CSSProperties = { display: "grid", gap: 10 };
const outputCol: React.CSSProperties = { display: "grid", gap: 10 };
const labelRow: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#cfd0e6" };
const textarea: React.CSSProperties = {
  minHeight: 240, background: "linear-gradient(135deg,#111,#17171b)", border: "1px solid #2d2d36",
  color: "#e8e8f5", padding: "12px 14px", borderRadius: 12, outline: "none", resize: "vertical"
};
const primaryBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#00ffa8,#00c7ff)", color: "#061014", fontWeight: 800,
  padding: "12px 14px", border: "none", borderRadius: 12, cursor: "pointer", justifySelf: "start"
};
const miniBtn: React.CSSProperties = { background: "#1b1b1f", border: "1px solid #2f2f38", color: "#d6d6e9", padding: "8px 12px", borderRadius: 10, cursor: "pointer" };
const selectBox: React.CSSProperties = {
  background: "#0f1015", color: "#e9e9ff", border: "1px solid #2a2d3c", borderRadius: 10, padding: "8px 10px"
};
const outputBox: React.CSSProperties = {
  minHeight: 240, background: "linear-gradient(135deg,#101116,#141722)", border: "1px solid #2c2f3d",
  borderRadius: 12, padding: 14
};
const placeholder: React.CSSProperties = { opacity: 0.6, padding: 6, fontSize: 14 };
const pre: React.CSSProperties = { margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit", fontSize: 15, lineHeight: 1.6 };
const toastOk: React.CSSProperties = {
  alignSelf: "start", background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)", color: "#000",
  padding: "6px 10px", borderRadius: 10, fontWeight: 700, marginTop: 6
};

const loaderCard: React.CSSProperties = {
  width: "100%", background: "linear-gradient(135deg,#111,#171822)", border: "1px solid #2a2d3a",
  borderRadius: 14, padding: 16, position: "relative", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.35)"
};
const loaderGlow: React.CSSProperties = {
  position: "absolute", inset: 0,
  background: "radial-gradient(600px 80px at 10% -10%,rgba(118,130,255,0.25),transparent), radial-gradient(600px 80px at 90% 120%,rgba(255,110,199,0.22),transparent)"
};
const loaderStep: React.CSSProperties = { fontSize: 16, fontWeight: 700, marginBottom: 10 };
const progressOuter: React.CSSProperties = { height: 10, background: "#20212a", borderRadius: 999, overflow: "hidden", border: "1px solid #2f3140" };
const progressInner: React.CSSProperties = { height: "100%", background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)", transition: "width 600ms ease" };
const loaderHint: React.CSSProperties = { marginTop: 8, color: "#a8a8c2", fontSize: 12 };

const changesBox: React.CSSProperties = {
  background: "linear-gradient(135deg,#101116,#141722)", border: "1px solid #2c2f3d", borderRadius: 12, padding: 14
};
const changesTitle: React.CSSProperties = { fontWeight: 800, marginBottom: 8, fontSize: 14, color: "#e9e9ff" };
const changeRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "auto 16px auto 1fr", gap: 8, alignItems: "center" };
const chipBad: React.CSSProperties = { background: "#2a1b1b", color: "#ffb3b3", border: "1px solid #4a2a2a", padding: "4px 8px", borderRadius: 8, fontSize: 13 };
const chipGood: React.CSSProperties = { background: "#1b2a24", color: "#9ff2cc", border: "1px solid #294a3b", padding: "4px 8px", borderRadius: 8, fontSize: 13 };
const reason: React.CSSProperties = { fontSize: 12, color: "#bfc2d6", paddingLeft: 8 };
