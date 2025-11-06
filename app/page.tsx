"use client";
import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { syncProfile } from "../utils/syncProfile"; // put this at the top with your other imports

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Splash screen timeout (3 seconds)
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login"; // redirect if not logged in
      } else {
        setUser(data.user);
      }
    };
    getUser();
  }, []);

useEffect(() => {
  // Create or update the user record in Supabase
  syncProfile();
}, []);
  if (showSplash) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 20% 20%, #0a0a0f, #050507)",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontWeight: 800,
            background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Welcome to Eluna Mind
        </h1>
        <p style={{ color: "#b5b5c8", marginTop: "10px" }}>
          The smartest way to study ✨
        </p>
      </main>
    );
  }

  const handleGenerateNotes = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setNotes("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();

      if (res.status === 403 && data.upgrade) {
        alert(data.error);
        window.location.href = "/pricing";
        return;
      }

      setNotes(data.notes || "No notes generated.");
    } catch {
      setNotes("Error generating notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        background: "radial-gradient(circle at 20% 20%, #0a0a0f, #050507)",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* ---- NAVBAR ---- */}
      <header
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 60px",
          backdropFilter: "blur(10px)",
          background: "rgba(15,15,20,0.55)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          zIndex: 1000,
        }}
      >
        <h2
          style={{
            fontWeight: 800,
            fontSize: "24px",
            background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            cursor: "pointer",
          }}
          onClick={() => (window.location.href = "/")}
        >
          Eluna Mind
        </h2>

        {/* 3-dot vertical menu icon */}
        <div
          onClick={() => (window.location.href = "/menu")}
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            padding: "10px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            transition: "0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
        >
          <div
            style={{
              width: "5px",
              height: "5px",
              background: "#fff",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              width: "5px",
              height: "5px",
              background: "#fff",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              width: "5px",
              height: "5px",
              background: "#fff",
              borderRadius: "50%",
            }}
          />
        </div>
      </header>

      {/* ---- HERO / TOOL ---- */}
      <section
        style={{
          marginTop: "120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            fontWeight: 800,
            marginBottom: "10px",
          }}
        >
          The Smartest Way to Study
        </h1>
        <p style={{ color: "#b5b5c8", fontSize: "18px", marginBottom: "40px" }}>
          Create notes, flashcards, tests, and presentations with one click.
        </p>

        <div
          style={{
            backdropFilter: "blur(10px)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "25px",
            maxWidth: "700px",
            width: "90%",
            boxShadow: "0 0 30px rgba(0,0,0,0.25)",
          }}
        >
          <textarea
            placeholder="Enter your topic or question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: "100%",
              height: "130px",
              padding: "15px",
              borderRadius: "14px",
              border: "1px solid #24242e",
              background: "rgba(15,15,20,0.7)",
              color: "#fff",
              fontSize: "16px",
              outline: "none",
              resize: "none",
            }}
          />

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {[
              { name: "Generate Notes", color: "linear-gradient(90deg,#00ffa8,#00c7ff)", action: handleGenerateNotes },
              { name: "Q&A", color: "linear-gradient(90deg,#007bff,#00bfff)", link: "/qna" },
              { name: "Flashcards", color: "linear-gradient(90deg,#a56eff,#9b59b6)", link: "/flashcards" },
              { name: "Test", color: "linear-gradient(90deg,#ff8c00,#ffb347)", link: "/test" },
              { name: "Visual Map", color: "linear-gradient(90deg,#00ced1,#00e0ff)", link: "/visual-map" },
              { name: "Presentation", color: "linear-gradient(90deg,#ff6ec7,#6ea8ff)", link: "/presentation" },
              { name: "Citations", color: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)", link: "/citations" },
              { name: "Grammar", color: "linear-gradient(90deg,#00ffa8,#00c7ff)", link: "/grammar" },
              { name: "Paraphrasing", color: "linear-gradient(90deg,#ff4ec7,#ff8c00)", link: "/paraphrase" },
              { name: "Career Help", color: "linear-gradient(90deg,#6ea8ff,#55f2c8)", link: "/career" },
              { name: "Study Plan", color: "linear-gradient(90deg,#ff9a9e,#fad0c4)", link: "/study-plan" },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={() =>
                  btn.link
                    ? (window.location.href = btn.link)
                    : btn.action?.()
                }
                disabled={loading && btn.name === "Generate Notes"}
                style={{
                  background: btn.color,
                  color: "#000",
                  padding: "12px 22px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(255,255,255,0.1)",
                  transition: "all 0.25s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                {loading && btn.name === "Generate Notes"
                  ? "Loading..."
                  : btn.name}
              </button>
            ))}
          </div>
        </div>

        {notes && (
          <div
            style={{
              marginTop: "40px",
              background: "rgba(255,255,255,0.05)",
              padding: "25px",
              borderRadius: "14px",
              maxWidth: "700px",
              width: "100%",
              textAlign: "left",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 0 25px rgba(0,0,0,0.25)",
            }}
          >
            <h3
              style={{
                background: "linear-gradient(90deg,#00ffa8,#00c7ff)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontWeight: "800",
                marginBottom: "12px",
              }}
            >
              Notes
            </h3>
            <div
              dangerouslySetInnerHTML={{
                __html: notes
                  .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                  .replace(/## (.*?)\n/g, "<h3>$1</h3>")
                  .replace(/\n/g, "<br/>"),
              }}
            />
          </div>
        )}
      </section>

      {/* ---- FOOTER ---- */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "30px 60px",
          textAlign: "center",
          color: "#b5b5c8",
          fontSize: "14px",
          background: "rgba(10,10,15,0.9)",
        }}
      >
        <div
          style={{
            height: "3px",
            background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
            borderRadius: "999px",
            width: "80%",
            margin: "0 auto 25px auto",
          }}
        />
        <p style={{ marginBottom: "6px" }}>
          Empowering smarter learning worldwide 🌍
        </p>
        <p>
          <a href="/privacy" style={{ color: "#6ea8ff", textDecoration: "none" }}>
            Privacy Policy
          </a>{" "}
          |{" "}
          <a href="/terms" style={{ color: "#6ea8ff", textDecoration: "none" }}>
            Terms
          </a>{" "}
          | © {new Date().getFullYear()} Eluna Mind Inc.
        </p>
      </footer>
    </main>
  );
}
