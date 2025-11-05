"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function HelpPage() {
  const [plan, setPlan] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setPlan("free");
          setChecking(false);
          return;
        }
        const { data, error } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        if (error || !data) setPlan("free");
        else setPlan(data.plan);
      } catch (err) {
        console.error(err);
        setPlan("free");
      } finally {
        setChecking(false);
      }
    };
    checkPlan();
  }, []);

  if (checking) {
    return (
      <main style={{ background: "#0d0d0d", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 10% -10%, #1b1f2a, transparent), radial-gradient(1000px 500px at 120% 120%, #261a2e, transparent), #0c0d12",
        color: "#fff",
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        padding: "40px 20px",
        position: "relative",
        textAlign: "center",
      }}
    >
      <button
        onClick={() => (window.location.href = "/")}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "#1b1b1f",
          border: "1px solid #2e2e38",
          color: "#ccc",
          padding: "8px 14px",
          borderRadius: "8px",
          cursor: "pointer",
          zIndex: 20,
        }}
      >
        ← Back
      </button>

      <h1
        style={{
          fontSize: "36px",
          background: "linear-gradient(90deg, #27f0c8, #3aa3ff, #b575ff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          marginBottom: "18px",
        }}
      >
        Help & Support
      </h1>

      <p style={{ maxWidth: 700, margin: "0 auto", color: "#ccc", fontSize: "16px", lineHeight: 1.6 }}>
        Welcome to Eluna Mind Support Center.  
        Here you can find help, report issues, or get guidance on how to use our tools effectively.  
        If you’re facing a problem, please reach out to our team directly via email.  
        We’ll assist you as soon as possible.
      </p>

      <div style={{ marginTop: "40px" }}>
        <p style={{ color: "#9bb8ff", fontSize: "18px" }}>Support Email</p>
        <p style={{ color: "#fff", fontWeight: "bold" }}>support@elunamind.app</p>
      </div>

      {plan !== "premium" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              background: "linear-gradient(90deg, #27f0c8, #3aa3ff, #b575ff)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              marginBottom: "16px",
            }}
          >
            Premium Feature Locked
          </h1>
          <p style={{ maxWidth: "500px", color: "#ccc", marginBottom: "30px" }}>
            Help & Support is available only for Premium members. Upgrade now to access direct support and priority responses.
          </p>
          <button
            onClick={() => (window.location.href = "/pricing")}
            style={{
              background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
              color: "#000",
              padding: "12px 22px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 0 18px rgba(58,163,255,0.4)",
            }}
          >
            Upgrade to Premium
          </button>
        </div>
      )}
    </main>
  );
}
