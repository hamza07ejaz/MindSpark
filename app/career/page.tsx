"use client";
import { useMemo, useState } from "react";

type Stage = "landing" | "opt1" | "opt2" | "opt3" | "result";
type ResultBlock = { title: string; body: string };

export default function CareerHelpPage() {
  const [stage, setStage] = useState<Stage>("landing");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultBlock[] | null>(null);
  const [copied, setCopied] = useState(false);

  // option 1 state
  const [dreamRole, setDreamRole] = useState("");

  // option 2 state (don’t know what to become)
  const q2 = useMemo(
    () => [
      { key: "strengths", label: "Your top strengths or subjects you enjoy", type: "text" },
      { key: "workStyle", label: "Preferred work style (creative, analytical, people-oriented, hands-on)", type: "text" },
      { key: "env", label: "Preferred environment (office, remote, lab, outdoors, on the move)", type: "text" },
      { key: "studyYears", label: "Max years you’re willing to study (0-8)", type: "number" },
      { key: "mathComfort", label: "Comfort with math and data (low, medium, high)", type: "text" },
      { key: "peopleVsTech", label: "Closer to people work or tech work", type: "text" },
      { key: "impact", label: "What impact excites you (health, climate, finance, education, innovation, safety)", type: "text" },
      { key: "risk", label: "Risk appetite (safe path, balanced, entrepreneurial)", type: "text" },
    ],
    []
  );
  const [a2, setA2] = useState<Record<string, string>>({});

  // option 3 state (side income)
  const q3 = useMemo(
    () => [
      { key: "target", label: "How much do you want to earn monthly (USD/CAD)", type: "text" },
      { key: "hours", label: "How many hours per day can you give", type: "number" },
      { key: "skills", label: "What are you good at or can learn quickly", type: "text" },
      { key: "online", label: "Online or offline preference", type: "text" },
      { key: "horizon", label: "Short term cash or long term asset building", type: "text" },
      { key: "budget", label: "Budget to start (can be 0)", type: "text" },
    ],
    []
  );
  const [a3, setA3] = useState<Record<string, string>>({});

  async function callApiOrFallback(payload: any): Promise<ResultBlock[]> {
    try {
      const res = await fetch("/api/career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.blocks)) {
          return data.blocks as ResultBlock[];
        }
      }
    } catch {
      // fall through to fallback
    }
    return fallbackGenerate(payload);
  }

  function fallbackGenerate(payload: any): ResultBlock[] {
    if (payload.mode === "opt1") {
      const role = payload.role?.trim() || "Your Target Role";
      return [
        {
          title: `${role}: overview`,
          body:
            `Why this role matters, typical mission, where it fits in the industry. ` +
            `Common entry titles and growth paths.`,
        },
        {
          title: "skills and knowledge",
          body:
            `Core skills to master, tools and frameworks, proof-of-work ideas ` +
            `(build a portfolio, mini-projects, internships).`,
        },
        {
          title: "education and credentials",
          body:
            `Suggested courses, certificates, degree preferences (if needed), ` +
            `free and paid learning tracks you can finish in stages.`,
        },
        {
          title: "12-month action plan",
          body:
            `Quarter by quarter plan: Q1 learn foundations, Q2 build 2 projects, ` +
            `Q3 internship/volunteer, Q4 job search system with targets.`,
        },
        {
          title: "first role and compensation",
          body:
            `Starter job titles, realistic comp range for your region, ` +
            `how to negotiate and level up in 6-12 months.`,
        },
        {
          title: "fast-track ideas",
          body:
            `Mentor outreach, competitions, certifications with high signal, ` +
            `public build-in-public showcasing to stand out.`,
        },
      ];
    }
    if (payload.mode === "opt2") {
      const s = (k: string) => (payload.answers?.[k] || "").toLowerCase();
      const analytical = s("workStyle").includes("analyt") || s("mathComfort").includes("high");
      const creative = s("workStyle").includes("creativ");
      const people = s("peopleVsTech").includes("people");
      const tech = s("peopleVsTech").includes("tech");

      const recs: string[] = [];
      if (tech || analytical) recs.push("Data Analyst / Product Analyst");
      if (creative) recs.push("UX/UI Designer");
      if (people) recs.push("Customer Success or Partnerships");
      if (s("impact").includes("health")) recs.push("Health Informatics Specialist");
      if (recs.length === 0) recs.push("Operations Coordinator");

      return [
        {
          title: "top matches",
          body: recs.join(" | "),
        },
        {
          title: "why these fit",
          body:
            `Based on your strengths, work style, study horizon, and impact preferences, ` +
            `these paths balance day-to-day fit with long-term opportunity.`,
        },
        {
          title: "how to start in 30 days",
          body:
            `Micro-curriculum with 3–5 resources, 2 small portfolio artifacts, ` +
            `and a repeatable networking script to land first interviews.`,
        },
        {
          title: "next steps",
          body:
            `Pick one track, commit to a 4-week sprint, then reassess. ` +
            `Ask me to generate another path if this doesn’t excite you, ` +
            `or ask for a step-by-step plan for your favorite option.`,
        },
      ];
    }
    // opt3
    const online = String(payload.answers?.online || "").toLowerCase().includes("online");
    const skills = String(payload.answers?.skills || "").toLowerCase();
    const dev = skills.includes("code") || skills.includes("python") || skills.includes("web");
    const design = skills.includes("design") || skills.includes("ui") || skills.includes("graphics");
    const writing = skills.includes("write") || skills.includes("content");

    const ideas: string[] = [];
    if (dev) ideas.push("Build micro-tools or Notion templates and sell on Gumroad");
    if (design) ideas.push("Offer ‘1-day landing page’ packages to local businesses");
    if (writing) ideas.push("Niche newsletter with affiliate offers");
    if (ideas.length === 0) {
      ideas.push(online ? "Remote research gigs on specialized platforms" : "Local high-ROI errands concierge");
    }

    return [
      {
        title: "side income ideas",
        body: ideas.join(" | "),
      },
      {
        title: "today’s setup",
        body:
          `Define offer, simple landing, single payment link, delivery workflow. ` +
          `Goal is first proof of payment in 72 hours.`,
      },
      {
        title: "scaling path",
        body:
          `Package into repeatable productized service or digital product, ` +
          `collect testimonials, run focused outreach in short daily sprints.`,
      },
      {
        title: "choose your next action",
        body:
          `Don’t like this? I can suggest another option. ` +
          `Want details? I can break down exact steps for execution.`,
      },
    ];
  }

  async function handleSubmitOpt1() {
    if (!dreamRole.trim()) return;
    setLoading(true);
    const blocks = await callApiOrFallback({ mode: "opt1", role: dreamRole.trim() });
    setResult(blocks);
    setStage("result");
    setLoading(false);
  }

  async function handleSubmitOpt2() {
    // ensure required answers (light check)
    setLoading(true);
    const blocks = await callApiOrFallback({ mode: "opt2", answers: a2 });
    setResult(blocks);
    setStage("result");
    setLoading(false);
  }

  async function handleSubmitOpt3() {
    setLoading(true);
    const blocks = await callApiOrFallback({ mode: "opt3", answers: a3 });
    setResult(blocks);
    setStage("result");
    setLoading(false);
  }

  function copyResult() {
    if (!result) return;
    const txt = result.map(b => `${b.title}\n${b.body}`).join("\n\n");
    navigator.clipboard.writeText(txt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function goBackHome() {
    setStage("landing");
    setResult(null);
    setDreamRole("");
    setA2({});
    setA3({});
    setLoading(false);
  }

  return (
    <main style={page}>
      <div style={heroGlow} />
      <div style={container}>
        <header style={header}>
          <button onClick={() => (window.location.href = "/")} style={backBtn}>← Back</button>
          <h1 style={title}>Career Coach</h1>
          <div />
        </header>

        {stage === "landing" && (
          <section style={panel}>
            <h2 style={subtitle}>Let’s figure out your next move</h2>
            <p style={muted}>Pick one option to continue</p>
            <div style={choices}>
              <button style={choiceBtnPink} onClick={() => setStage("opt1")}>
                I know what I want to become
                <span style={choiceSub}>but need the step-by-step plan</span>
              </button>
              <button style={choiceBtnBlue} onClick={() => setStage("opt2")}>
                I don’t know what to become
                <span style={choiceSub}>help me discover my path</span>
              </button>
              <button style={choiceBtnGreen} onClick={() => setStage("opt3")}>
                I want side income while studying
                <span style={choiceSub}>tailored to my time and skills</span>
              </button>
            </div>
          </section>
        )}

        {stage === "opt1" && (
          <section style={panel}>
            <h3 style={sectionTitle}>Tell me your dream role</h3>
            <input
              value={dreamRole}
              onChange={(e) => setDreamRole(e.target.value)}
              placeholder="Example: Data Scientist, Corporate Lawyer, Pilot"
              style={input}
            />
            <div style={row}>
              <button style={primary} onClick={handleSubmitOpt1} disabled={loading || !dreamRole.trim()}>
                {loading ? "Generating…" : "Generate My Plan"}
              </button>
              <button style={ghost} onClick={goBackHome}>Go Back</button>
            </div>
          </section>
        )}

        {stage === "opt2" && (
          <section style={panel}>
            <h3 style={sectionTitle}>Answer a few quick questions</h3>
            <div style={grid}>
              {q2.map((q) => (
                <div key={q.key} style={qCard}>
                  <label style={label}>{q.label}</label>
                  <input
                    type={q.type === "number" ? "number" : "text"}
                    value={a2[q.key] || ""}
                    onChange={(e) => setA2((prev) => ({ ...prev, [q.key]: e.target.value }))}
                    style={input}
                  />
                </div>
              ))}
            </div>
            <div style={row}>
              <button style={primary} onClick={handleSubmitOpt2} disabled={loading}>
                {loading ? "Thinking…" : "Submit"}
              </button>
              <button style={ghost} onClick={goBackHome}>Go Back</button>
            </div>
          </section>
        )}

        {stage === "opt3" && (
          <section style={panel}>
            <h3 style={sectionTitle}>Answer these to tailor side income</h3>
            <div style={grid}>
              {q3.map((q) => (
                <div key={q.key} style={qCard}>
                  <label style={label}>{q.label}</label>
                  <input
                    type={q.type === "number" ? "number" : "text"}
                    value={a3[q.key] || ""}
                    onChange={(e) => setA3((prev) => ({ ...prev, [q.key]: e.target.value }))}
                    style={input}
                  />
                </div>
              ))}
            </div>
            <div style={row}>
              <button style={primary} onClick={handleSubmitOpt3} disabled={loading}>
                {loading ? "Planning…" : "Submit"}
              </button>
              <button style={ghost} onClick={goBackHome}>Go Back</button>
            </div>
          </section>
        )}

        {stage === "result" && result && (
          <section style={panel}>
            <div style={resultHeader}>
              <h3 style={sectionTitle}>Your personalized plan</h3>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={copyBtn} onClick={copyResult}>Copy</button>
                <button style={ghost} onClick={goBackHome}>Go Back</button>
              </div>
            </div>
            <div style={resultGrid}>
              {result.map((b, i) => (
                <div key={i} style={resultCard}>
                  <div style={resultTitle}>{b.title}</div>
                  <div style={resultBody}>{b.body}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {copied && <div style={toast}>Copied to clipboard</div>}
      </div>
    </main>
  );
}

/* theme and styles */
const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "radial-gradient(1200px 600px at 10% -10%, #1b1f2a, transparent), radial-gradient(1000px 500px at 120% 120%, #261a2e, transparent), #0c0d12",
  color: "#fff",
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  position: "relative",
};

const heroGlow: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(600px 200px at 20% 10%, rgba(95,161,255,0.15), transparent), radial-gradient(500px 180px at 80% 90%, rgba(255,118,198,0.12), transparent)",
  pointerEvents: "none",
};

const container: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "28px" };

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const backBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e6e6ff",
  padding: "8px 12px",
  borderRadius: 12,
  cursor: "pointer",
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: 0.2,
  background: "linear-gradient(90deg, #9bb8ff, #ff93d2, #6ff2d0)",
  WebkitBackgroundClip: "text",
  color: "transparent",
};

const subtitle: React.CSSProperties = { margin: "0 0 6px 0", fontSize: 20, fontWeight: 800 };
const muted: React.CSSProperties = { margin: 0, color: "#b9bdd6" };

const panel: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 18,
  padding: 20,
  backdropFilter: "blur(8px)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  marginTop: 18,
};

const choices: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
  marginTop: 14,
};

const baseChoice: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 6,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  cursor: "pointer",
  boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
};

const choiceBtnPink: React.CSSProperties = {
  ...baseChoice,
  background: "linear-gradient(135deg, #2a1a24, #211a2c)",
  color: "#ffd9f1",
};

const choiceBtnBlue: React.CSSProperties = {
  ...baseChoice,
  background: "linear-gradient(135deg, #192535, #182233)",
  color: "#d6e6ff",
};

const choiceBtnGreen: React.CSSProperties = {
  ...baseChoice,
  background: "linear-gradient(135deg, #152a25, #16241f)",
  color: "#d6ffef",
};

const choiceSub: React.CSSProperties = { fontSize: 12, opacity: 0.85 };

const sectionTitle: React.CSSProperties = { margin: "2px 0 12px 0", fontSize: 18, fontWeight: 800 };

const input: React.CSSProperties = {
  width: "100%",
  background: "rgba(12,14,20,0.8)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#f2f2ff",
  padding: "12px 14px",
  borderRadius: 12,
  outline: "none",
};

const row: React.CSSProperties = { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" };

const primary: React.CSSProperties = {
  background: "linear-gradient(90deg, #79ffd6, #6aaeff)",
  color: "#041217",
  fontWeight: 900,
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
};

const ghost: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#e8e8ff",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
};

const qCard: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 14,
  padding: 12,
};

const label: React.CSSProperties = { fontSize: 12, color: "#cbd0ea" };

const resultHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 8,
};

const copyBtn: React.CSSProperties = {
  background: "linear-gradient(90deg, #27f0c8, #3aa3ff, #b575ff)",
  color: "#061014",
  fontWeight: 800,
  padding: "10px 14px",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
};

const resultGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
};

const resultCard: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: 14,
  minHeight: 120,
};

const resultTitle: React.CSSProperties = { fontWeight: 900, marginBottom: 6, fontSize: 14 };
const resultBody: React.CSSProperties = { color: "#dfe3ff", fontSize: 13, lineHeight: 1.5 };

const toast: React.CSSProperties = {
  position: "fixed",
  top: 18,
  right: 18,
  background: "linear-gradient(90deg,#79ffd6,#6aaeff)",
  color: "#061014",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 800,
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
}; 
