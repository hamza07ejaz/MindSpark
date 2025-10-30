"use client";
import React, { useState } from "react";

export default function QnAPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerateQnA = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/generate-qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();
      setResult(data.result || "No Q&A generated.");
    } catch (error) {
      console.error(error);
      setResult("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🤖 Generate Q&A</h1>
      <input
        type="text"
        placeholder="Enter a study topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full max-w-md p-3 rounded-lg text-black mb-4"
      />
      <button
        onClick={handleGenerateQnA}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-semibold"
      >
        {loading ? "Generating..." : "Generate Q&A"}
      </button>

      <div className="w-full max-w-2xl mt-8 bg-gray-900 p-5 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Results:</h2>
        <pre className="whitespace-pre-wrap text-gray-300">{result}</pre>
      </div>
    </div>
  );
}
