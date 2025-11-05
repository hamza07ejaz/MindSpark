"use client";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // or "signup"

  const handleAuth = async () => {
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else window.location.href = "/";
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Signup successful! Please check your email to verify.");
    }
    setLoading(false);
  };

  return (
    <main
      style={{
        background: "radial-gradient(circle at 20% 20%, #0a0a0f, #050507)",
        color: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "36px", fontWeight: 800 }}>Eluna Mind</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#111",
            color: "#fff",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#111",
            color: "#fff",
          }}
        />
        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
            border: "none",
            padding: "12px",
            borderRadius: "8px",
            color: "#000",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
        </button>

        <p
          style={{ color: "#aaa", fontSize: "14px", cursor: "pointer" }}
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login"
            ? "Don’t have an account? Sign up"
            : "Already have an account? Log in"}
        </p>
      </div>
    </main>
  );
}
