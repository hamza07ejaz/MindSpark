"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

type StyleType = "APA" | "MLA" | "Chicago";
type Citation = { text: string };

export default function CitationsPage() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<StyleType>("APA");
  const [count, setCount] = useState<number>(6);
  const [loading, setLoading] = useState(false);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [copiedOne, setCopiedOne] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const [plan, setPlan] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkPlan = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setPlan("free");
        setChecking(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .single();
      setPlan(data?.plan || "free");
      setChecking(false);
    };
    checkPlan();
  }, []);

  const steps = useMemo(
    () => [
      "Scanning sources…",
      "Formatting entries…",
      "Checking punctuation…",
      "Polishing capitalization…",
      "Finalizing references…",
    ],
    []
  );
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => (s + 1 < steps.length ? s + 1 : s));
    }, 900);
    return () => clearInterval(id);
  }, [loading, steps.length]);

  const progress = Math.round(((step + 1) / steps.length) * 100);

  async function generate() {
    if (!topic.trim()) return;

    // ✅ Block free users
    if (plan !== "premium") {
      alert("Upgrade to Premium to use the Citation feature.");
      return;
    }

    setLoading(true);
    setCitations([]);
    try {
      const res = await fetch("/api/generate-citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style, count }),
      });
      const data = await res.json();
      if (Array.isArray(data.citations)) {
        setCitations(
          data.citations
            .map((c: any) => ({ text: String(c.text || "").trim() }))
            .filter((c: Citation) => c.text.length > 0)
            .slice(0, 8)
        );
      } else {
        setCitations([]);
      }
    } catch (e) {
      console.error(e);
      setCitations([]);
    } finally {
      setLoading(false);
    }
  }

  function copyOne(idx: number) {
    const t = citations[idx]?.text || "";
    if (!t) return;
    navigator.clipboard.writeText(t).then(() => {
      setCopiedOne(idx);
      setTimeout(() => setCopiedOne(null), 1500);
    });
  }

  function copyAll() {
    const all = citations.map((c) => c.text).join("\n\n");
    if (!all.trim()) return;
    navigator.clipboard.writeText(all).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    });
  }

  if (checking) {
    return (
      <div style={{ color: "white", textAlign: "center", padding: 50 }}>
        Checking access...
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={container}>
        <div style={header}>
          <button onClick={() => (window.location.href = "/")} style={backBtn}>
            ← Back
          </button>
          <h1 style={title}>AI Citation Generator</h1>
        </div>

        <div style={card}>
          <div style={row}>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g., Causes of World War II)"
              style={input}
            />
            <button onClick={generate} disabled={loading} style={primaryBtn}>
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>

          <div style={rowWrap}>
            <div style={miniLabel}>Format</div>
            <div style={pillRow}>
              <button
                onClick={() => setStyle("APA")}
                style={{ ...pillBtn, ...(style === "APA" ? pillActive : {}) }}
              >
                APA
              </button>
              <button
                onClick={() => setStyle("MLA")}
                style={{ ...pillBtn, ...(style === "MLA" ? pillActive : {}) }}
              >
                MLA
              </button>
              <button
                onClick={() => setStyle("Chicago")}
                style={{
                  ...pillBtn,
                  ...(style === "Chicago" ? pillActive : {}),
                }}
              >
                Chicago
              </button>
            </div>

            <div style={miniLabel}>Count</div>
            <div style={pillRow}>
              {[5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  style={{ ...pillBtn, ...(count === n ? pillActive : {}) }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div style={loaderCard}>
            <div style={loaderGlow} />
            <div style={loaderStep}>{steps[step]}</div>
            <div style={progressOuter}>
              <div style={{ ...progressInner, width: `${progress}%` }} />
            </div>
            <div style={hint}>
              Please wait while we craft {count} {style} citations…
            </div>
          </div>
        )}

        {!loading && citations.length > 0 && (
          <>
            <div style={list}>
              {citations.map((c, i) => (
                <div key={i} style={item}>
                  <div style={indexBadge}>{i + 1}</div>
                  <div style={citeText}>{c.text}</div>
                  <button onClick={() => copyOne(i)} style={copyBtn}>
                    {copiedOne === i ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>

            <div style={footerRow}>
              <button onClick={copyAll} style={copyAllBtn}>
                {copiedAll ? "All Copied" : "Copy All Citations"}
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`html,body{background:#0d0d0d}`}</style>
    </div>
  );
}

/* === styles (unchanged) === */
const page: React.CSSProperties = { minHeight: "100vh", background: "#0d0d0d", color: "#fff" };
const container: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: 24 };
const header: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 };
const backBtn: React.CSSProperties = {
  background: "#1c1c1f", border: "1px solid #31313a", color: "#cfcfe6",
  padding: "8px 12px", borderRadius: 10, cursor: "pointer",
};
const title: React.CSSProperties = {
  fontSize: 26, fontWeight: 800,
  background: "linear-gradient(90deg,#ff6ec7,#6ea8ff,#55f2c8)",
  WebkitBackgroundClip: "text", color: "transparent", margin: 0,
};
const card: React.CSSProperties = {
  background: "linear-gradient(135deg,#101116,#141722)",
  border: "1px solid #2c2f3d",
  borderRadius: 16,
  padding: 16,
  marginTop: 8,
};
const row: React.CSSProperties = { display: "flex", gap: 10, alignItems: "center", marginBottom: 12 };
const rowWrap: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: 10,
  alignItems: "center",
};
const miniLabel: React.CSSProperties = { color: "#bfc0d7", fontSize: 13, marginRight: 6 };
const pillRow: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
const input: React.CSSProperties = {
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
  background: "linear-gradient(90deg,#00ffa8,#00c7ff)", color: "#061014", fontWeight: 800,
  padding: "12px 14px", border: "none", borderRadius: 12, cursor: "pointer",
};
const pillBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#2b2f44,#1d2030)",
  border: "1px solid #32364a",
  color: "#d8daf2",
  padding: "8px 10px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 0 12px rgba(0,0,0,0.25)",
};
const pillActive: React.CSSProperties = {
  background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
  color: "#031016",
  border: "1px solid #3d99ff",
};
const loaderCard: React.CSSProperties = {
  width: "100%", maxWidth: 640, margin: "26px auto 0",
  background: "linear-gradient(135deg,#111,#171822)",
  border: "1px solid #2a2d3a",
  borderRadius: 18,
  padding: 20,
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
};
const loaderGlow: React.CSSProperties = {
  position: "absolute", inset: 0,
  background: "radial-gradient(600px 80px at 10% -10%,rgba(118,130,255,0.25),transparent), radial-gradient(600px 80px at 90% 120%,rgba(255,110,199,0.22),transparent)",
};
const loaderStep: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginBottom: 12, position: "relative" };
const progressOuter: React.CSSProperties = { height: 10, background: "#20212a", borderRadius: 999, overflow: "hidden", border: "1px solid #2f3140" };
const progressInner: React.CSSProperties = { height: "100%", background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)", transition: "width 600ms ease" };
const hint: React.CSSProperties = { marginTop: 10, color: "#a8a8c2", fontSize: 13 };
const list: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 10, marginTop: 18 };
const item: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "40px 1fr auto",
  alignItems: "center",
  gap: 10,
  background: "linear-gradient(135deg,#101116,#141722)",
  border: "1px solid #2c2f3d",
  borderRadius: 12,
  padding: "12px 14px",
};
const indexBadge: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center",
  background: "#1b1b1f", border: "1px solid #2e3040", color: "#cfd0e6", fontWeight: 800,
};
const citeText: React.CSSProperties = { color: "#eef0ff", fontSize: 15, lineHeight: 1.4 };
const copyBtn: React.CSSProperties = {
  background: "#1b1b1f", border: "1px solid #2f2f38", color: "#d6d6e9",
  padding: "8px 10px", borderRadius: 10, cursor: "pointer",
};
const footerRow: React.CSSProperties = { display: "flex", justifyContent: "flex-end", marginTop: 12 };
const copyAllBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
  color: "#051218", fontWeight: 900,
  padding: "12px 16px", border: "none", borderRadius: 12, cursor: "pointer",
};
