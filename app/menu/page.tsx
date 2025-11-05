"use client";

export default function MenuPage() {
  const links = [
    { name: "Pricing", link: "/pricing" },
    { name: "Sign Up / Login", link: "/auth" },
    { name: "Help & Support", link: "/help" },
    { name: "About", link: "/about" },
  ];

  return (
    <main
      style={{
        background: "radial-gradient(circle at 20% 20%, #0a0a0f, #050507)",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        textAlign: "center",
        padding: "30px",
      }}
    >
      {/* Heading */}
      <h1
        style={{
          fontSize: "42px",
          fontWeight: 900,
          background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          marginBottom: "50px",
          letterSpacing: "1px",
        }}
      >
        Menu
      </h1>

      {/* Menu Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {links.map((item, i) => (
          <button
            key={i}
            onClick={() => (window.location.href = item.link)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(15px)",
              padding: "16px 20px",
              borderRadius: "14px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              transition: "0.25s",
              textShadow: "0 0 12px rgba(255,255,255,0.1)",
              boxShadow: "0 0 25px rgba(0,0,0,0.3)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)";
              e.currentTarget.style.color = "#000";
              e.currentTarget.style.boxShadow =
                "0 0 25px rgba(58,163,255,0.5)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.boxShadow =
                "0 0 25px rgba(0,0,0,0.3)";
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Back Button */}
      <button
        onClick={() => (window.location.href = "/")}
        style={{
          marginTop: "60px",
          background: "linear-gradient(90deg,#27f0c8,#3aa3ff,#b575ff)",
          color: "#000",
          fontWeight: "bold",
          padding: "14px 36px",
          borderRadius: "14px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          boxShadow: "0 0 18px rgba(58,163,255,0.5)",
          transition: "0.25s",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.transform = "scale(1.05)")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        ← Go Back
      </button>
    </main>
  );
}
