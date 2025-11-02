"use client";
import { useState } from "react";

export default function StudyPlanPage() {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGeneratePlan = async () => {
    if (!subject.trim() || !examDate.trim() || !hoursPerDay.trim()) return;
    setLoading(true);
    setPlan("");

    try {
      const res = await fetch("/api/generate-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          examDate,
          hoursPerDay,
        }),
      });

      const data = await res.json();
      setPlan(data.plan || "No plan generated.");
    } catch (err) {
      console.error(err);
      setPlan("Error generating plan.");
    } finally {
      setLoading(false);
    }
  };

  const copyPlan = () => {
    navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main
      style={{
        background: "linear-gradient(180deg,#0d0d0d,#151515)",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "40px 20px",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "25px" }}>📚 Get Study Plan</h1>

      <div
        style={{
          background: "#111",
          padding: "25px",
          borderRadius: "12px",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "0 0 15px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject or topic..."
          style={inputStyle}
        />
        <input
  value={examDate}
  onChange={(e) => setExamDate(e.target.value)}
  placeholder="Enter how many days you have to study (e.g., 30)"
  style={inputStyle}
/>
        <input
          value={hoursPerDay}
          onChange={(e) => setHoursPerDay(e.target.value)}
          placeholder="Available study hours per day..."
          style={inputStyle}
        />

        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          style={mainBtn}
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>

        {plan && (
          <>
            <div
              style={{
                background: "#1a1a1a",
                padding: "20px",
                borderRadius: "8px",
                marginTop: "10px",
                whiteSpace: "pre-wrap",
              }}
            >
              {plan}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button onClick={copyPlan} style={copyBtn}>
                {copied ? "Copied!" : "Copy Plan"}
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                style={backBtn}
              >
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #333",
  background: "#0f0f0f",
  color: "#fff",
  outline: "none",
};

const mainBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#00ffa8,#00c7ff)",
  color: "#000",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const copyBtn: React.CSSProperties = {
  background: "#222",
  color: "#fff",
  border: "1px solid #333",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
};

const backBtn: React.CSSProperties = {
  background: "linear-gradient(90deg,#ff6ec7,#6ea8ff)",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
};
