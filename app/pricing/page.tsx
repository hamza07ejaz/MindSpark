"use client";
import React from "react";
import { createClient } from "@supabase/supabase-js"; // ✅ ADD THIS

// ✅ Supabase client for frontend auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0 / month",
      features: [
        "2 Notes per day",
        "1 Q&A per day",
        "Access to Free Study Plan",
        "Access to Free career help",
      ],
      color: "linear-gradient(90deg,#3aa3ff,#b575ff)",
      border: "rgba(80,120,255,0.5)",
    },
    {
      name: "Premium",
      price: "$15.99 / month",
      features: [
        "Unlimited Notes & Q&A",
        "Access to all tools (Flashcards, Test, Visual Map, Presentation, Career Help, Paraphrasing, Grammar, Citations)",
        "Study Plans",
        "Priority Support 24/7",
        "Cancel Anytime",
      ],
      color: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
      border: "rgba(80,255,200,0.6)",
    },
  ];

  const handleUpgrade = async (planName: string) => {
  if (planName === "Free") {
    alert("Free plan selected");
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id || !session.user.email) {
    alert("Please log in first");
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.user.id,
        email: session.user.email,
      }),
    });

    const result = await response.json();

    if (response.ok && result.url) {
      window.location.href = result.url;
    } else {
      alert(result.error || "Unable to start checkout session");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }
};

    // 1. get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Please log in first");
      window.location.href = "/login";
      return;
    }

    try {
      // 2. call backend API with auth token
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        alert(result.error || "Unable to start checkout session");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  // your UI stays 100% same
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 20%, #0a0a0f, #050507)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        padding: "40px 20px",
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          fontWeight: "800",
          background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          marginBottom: "40px",
        }}
      >
        Pricing Plans
      </h1>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "30px",
          maxWidth: "1000px",
        }}
      >
        {plans.map((plan, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${plan.border}`,
              borderRadius: "20px",
              padding: "40px 30px",
              width: "300px",
              textAlign: "center",
              boxShadow: "0 0 25px rgba(0,0,0,0.3)",
              backdropFilter: "blur(15px)",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                background: plan.color,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {plan.name}
            </h2>
            <p style={{ fontSize: "22px", marginBottom: "20px" }}>
              {plan.price}
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                textAlign: "left",
                color: "#cfcfe6",
                marginBottom: "25px",
              }}
            >
              {plan.features.map((f, i) => (
                <li key={i} style={{ marginBottom: "8px" }}>
                  ✅ {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.name)}
              style={{
                background: plan.color,
                color: "#000",
                fontWeight: "bold",
                padding: "12px 20px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                transition: "transform 0.25s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {plan.name === "Free" ? "Get Started" : "Upgrade Now"}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => (window.location.href = "/")}
        style={{
          marginTop: "50px",
          background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
          color: "#000",
          fontWeight: "bold",
          padding: "12px 26px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          transition: "0.25s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        ← Go Back
      </button>
    </main>
  );
}
