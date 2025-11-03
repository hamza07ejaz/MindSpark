"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 30% 30%, #0a0a0f, #050507)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleAuth}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "40px 30px",
          width: "350px",
          textAlign: "center",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 25px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 800,
            background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "25px",
          }}
        >
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h1>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "10px",
              background:
                mode === "login"
                  ? "linear-gradient(90deg,#27f0c8,#3aa3ff)"
                  : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: "10px",
              background:
                mode === "signup"
                  ? "linear-gradient(90deg,#b575ff,#3aa3ff)"
                  : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Sign Up
          </button>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading
            ? mode === "signup"
              ? "Creating..."
              : "Logging in..."
            : mode === "signup"
            ? "Sign Up"
            : "Login"}
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          type="button"
          style={backBtn}
        >
          ← Go Back
        </button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 15px",
  marginBottom: "15px",
  borderRadius: "10px",
  border: "1px solid #2f2f3a",
  background: "rgba(15,15,20,0.8)",
  color: "#fff",
  outline: "none",
  fontSize: "15px",
};

const btnStyle: React.CSSProperties = {
  background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
  color: "#000",
  border: "none",
  padding: "12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 700,
  width: "100%",
  fontSize: "16px",
  transition: "0.3s",
};

const backBtn: React.CSSProperties = {
  marginTop: "20px",
  background: "transparent",
  color: "#999",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};
