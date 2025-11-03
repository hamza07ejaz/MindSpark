"use client";

import { useState } from "react";

interface Flashcard {
  question: string;
  answer: string;
}

export default function FlashcardsPage() {
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateFlashcards = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.flashcards)) {
        setFlashcards(data.flashcards);
        setIndex(0);
      } else {
        setError(data.error || "Failed to generate flashcards.");
      }
    } catch (err) {
      console.error(err);
      setError("Server Error.");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => setFlipped(!flipped);
  const nextCard = () =>
    setIndex((prev) => (prev + 1) % flashcards.length);
  const prevCard = () =>
    setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col items-center justify-center px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">AI Flashcards Generator</h1>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a study topic..."
        className="w-full max-w-md p-3 rounded-lg outline-none mb-4 placeholder-gray-400"
        style={{ backgroundColor: "#222", color: "#fff" }}
      />

      <button
        onClick={generateFlashcards}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold"
      >
        {loading ? "Generating..." : "Generate Flashcards"}
      </button>
      <button
  onClick={() => (window.location.href = "/")}
  style={{
    marginTop: "40px",
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

      {error && <p className="text-red-400 mt-3">{error}</p>}

      {flashcards.length > 0 && (
        <div className="mt-10 flex flex-col items-center space-y-6">
          <div
            className={`relative w-96 h-56 bg-gray-800 rounded-xl flex items-center justify-center text-center cursor-pointer shadow-lg transition-transform duration-500 ${
              flipped ? "rotate-y-180" : ""
            }`}
            onClick={handleFlip}
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
          >
            <div
              className="absolute w-full h-full flex items-center justify-center px-6 text-xl backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              {flashcards[index]?.question}
            </div>
            <div
              className="absolute w-full h-full flex items-center justify-center px-6 text-xl"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >
              {flashcards[index]?.answer}
            </div>
          </div>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={prevCard}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
            >
              Previous
            </button>
            <button
              onClick={nextCard}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
            >
              Next
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
