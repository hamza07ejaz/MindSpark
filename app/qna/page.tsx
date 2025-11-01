"use client";
import { useState } from "react";

export default function QnAPage() {
  const [topic, setTopic] = useState("");
  const [qna, setQna] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateQnA = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first.");
      return;
    }
    setLoading(true);
    setError("");
    setQna([]);

    try {
      const res = await fetch("/api/generate-qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data.qna)) {
        setQna(data.qna);
      } else {
        setError(data.error || "Failed to generate Q&A.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while generating Q&A.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const text = qna
      .map((item, i) => `Q${i + 1}: ${item.question}\nA: ${item.answer}\n`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex flex-col items-center px-6 py-10">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
        AI Q&A Generator
      </h1>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter your study topic..."
        className="w-full max-w-lg p-3 rounded-lg text-black outline-none mb-4"
      />

      <button
        onClick={generateQnA}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold transition"
      >
        {loading ? "Generating..." : "Generate Q&A"}
      </button>

      {error && <p className="text-red-400 mt-3">{error}</p>}

      {qna.length > 0 && (
        <div className="mt-10 w-full max-w-2xl space-y-6">
          {qna.map((item, i) => (
            <div
              key={i}
              className="bg-gray-900/70 p-5 rounded-2xl border border-gray-700 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <p className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Q{i + 1}. {item.question}
              </p>
              <p className="text-gray-200 mt-2 leading-relaxed">{item.answer}</p>
            </div>
          ))}

          <div className="flex gap-4 mt-8 justify-center">
            <button
              onClick={handleCopy}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-semibold"
            >
              {copied ? "✅ Copied!" : "Copy All Q&A"}
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
