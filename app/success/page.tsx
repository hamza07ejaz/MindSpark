"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const refreshPlan = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.email) {
          window.location.href = "/login";
          return;
        }

        // Fetch updated plan from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", session.user.id)
          .single();

        if (error) console.error("Error refreshing plan:", error);
        if (data?.plan === "premium") {
          setDone(true);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    refreshPlan();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0a0a0f",
          color: "#fff",
        }}
      >
        <h2>Processing your payment...</h2>
      </div>
    );
  }

  if (done) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0a0a0f",
          color: "#fff",
        }}
      >
        <h2>✅ Payment successful! Premium unlocked.</h2>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            background:
              "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0a0a0f",
        color: "#fff",
      }}
    >
      <h2>Payment verified but not updated yet. Please refresh in 10s.</h2>
    </div>
  );
}
