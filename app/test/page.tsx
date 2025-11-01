"use client";

import { useState } from "react";

type MCQ = { question: string; options: string[]; correctIndex: number };
type TF = { statement: string; answer: boolean };
type QA = { question: string; answer: string };
type TestPayload = { mcqs: MCQ[]; trueFalse: TF[]; short: QA[]; long: QA[] };

export default function TestPage() {
  const [topic, setTopic] = useState("");
  const [data, setData] = useState<TestPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // user answers
  const [mcqAns, setMcqAns] = useState<number[]>([]);
  const [tfAns, setTfAns] = useState<(boolean | null)[]>([]);
  const [shortAns, setShortAns] = useState<string[]>([]);
  const [longAns, setLongAns] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const resetAnswers = (t: TestPayload) => {
    setMcqAns(Array(t.mcqs.length).fill(-1));
    setTfAns(Array(t.trueFalse.length).fill(null));
    setShortAns(Array(t.short.length).fill(""));
    setLongAns(Array(t.long.length).fill(""));
    setSubmitted(false);
    setScore(0);
  };

  const generate = async () => {
    if (!topic.trim()) return setError("Please enter a topic.");
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate test");
      const t: TestPayload = json.test;
      setData(t);
      resetAnswers(t);
    } catch (e: any) {
      setError(e.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (!data) return;
    let s = 0;

    // MCQs
    data.mcqs.forEach((q, i) => {
      if (mcqAns[i] === q.correctIndex) s += 1;
    });

    // True/False
    data.trueFalse.forEach((q, i) => {
      if (tfAns[i] === q.answer) s += 1;
    });

    // Short & Long (informational scoring — award 0; show correct key after submit)
    // If later you want fuzzy matching, we can add string similarity.

    setScore(s);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-5 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">AI Test Generator</h1>
          <button
            onClick={() => (window.location.href = "/")}
            className="rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2 font-semibold"
          >
            Go Back
          </button>
        </div>

        <div className="flex gap-3 mb-8">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a study topic..."
            className="flex-1 rounded-xl bg-gray-800/70 text-white placeholder-gray-300 px-4 py-3 outline-none border border-gray-700 focus:border-blue-500"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-xl bg-green-500 hover:bg-green-600 px-5 py-3 font-semibold"
          >
            {loading ? "Generating..." : "Generate Test"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-600 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {!data && !loading && (
          <p className="text-gray-300">Create a full test from any topic.</p>
        )}

        {data && (
          <div className="space-y-10">
            {/* MCQs */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Multiple Choice (8)</h2>
              <div className="space-y-6">
                {data.mcqs.map((q, i) => (
                  <div key={i} className="rounded-xl bg-gray-800/60 p-4 border border-gray-700">
                    <p className="font-medium mb-3">{i + 1}. {q.question}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {q.options.map((opt, idx) => {
                        const isChosen = mcqAns[i] === idx;
                        const isCorrect = submitted && idx === q.correctIndex;
                        const isWrong =
                          submitted && isChosen && idx !== q.correctIndex;

                        return (
                          <button
                            key={idx}
                            onClick={() => !submitted && setMcqAns(prev => {
                              const copy = [...prev]; copy[i] = idx; return copy;
                            })}
                            className={`text-left rounded-lg px-3 py-2 border
                              ${isChosen ? "border-blue-400" : "border-gray-700"}
                              ${submitted && isCorrect ? "bg-green-600/30 border-green-500" : ""}
                              ${submitted && isWrong ? "bg-red-600/30 border-red-500" : ""}
                              hover:border-blue-400`}
                          >
                            {String.fromCharCode(65 + idx)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && (
                      <p className="mt-2 text-sm text-gray-300">
                        Correct answer: <span className="text-green-400">
                          {q.options[q.correctIndex]}
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* True / False */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">True / False (8)</h2>
              <div className="space-y-4">
                {data.trueFalse.map((q, i) => (
                  <div key={i} className="rounded-xl bg-gray-800/60 p-4 border border-gray-700">
                    <p className="font-medium mb-3">{i + 1}. {q.statement}</p>
                    <div className="flex gap-3">
                      {([true, false] as const).map(val => {
                        const chosen = tfAns[i] === val;
                        const correct = submitted && q.answer === val;
                        const wrong = submitted && chosen && q.answer !== val;
                        return (
                          <button
                            key={String(val)}
                            onClick={() => !submitted && setTfAns(prev => {
                              const copy = [...prev]; copy[i] = val; return copy;
                            })}
                            className={`rounded-lg px-4 py-2 border 
                              ${chosen ? "border-blue-400" : "border-gray-700"}
                              ${submitted && correct ? "bg-green-600/30 border-green-500" : ""}
                              ${submitted && wrong ? "bg-red-600/30 border-red-500" : ""}
                              hover:border-blue-400`}
                          >
                            {val ? "True" : "False"}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && (
                      <p className="mt-2 text-sm text-gray-300">
                        Correct answer: <span className="text-green-400">{q.answer ? "True" : "False"}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Short Answer */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Short Answer (5)</h2>
              <div className="space-y-4">
                {data.short.map((q, i) => (
                  <div key={i} className="rounded-xl bg-gray-800/60 p-4 border border-gray-700">
                    <p className="font-medium mb-3">{i + 1}. {q.question}</p>
                    <textarea
                      value={shortAns[i] || ""}
                      onChange={(e) => !submitted && setShortAns(prev => {
                        const copy = [...prev]; copy[i] = e.target.value; return copy;
                      })}
                      className="w-full min-h-[80px] rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2 outline-none focus:border-blue-500"
                      placeholder="Type your answer…"
                    />
                    {submitted && (
                      <p className="mt-2 text-sm text-gray-300">
                        Model answer: <span className="text-green-400">{q.answer}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Long Answer */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">Long Answer (2)</h2>
              <div className="space-y-4">
                {data.long.map((q, i) => (
                  <div key={i} className="rounded-xl bg-gray-800/60 p-4 border border-gray-700">
                    <p className="font-medium mb-3">{i + 1}. {q.question}</p>
                    <textarea
                      value={longAns[i] || ""}
                      onChange={(e) => !submitted && setLongAns(prev => {
                        const copy = [...prev]; copy[i] = e.target.value; return copy;
                      })}
                      className="w-full min-h-[120px] rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2 outline-none focus:border-blue-500"
                      placeholder="Write your answer…"
                    />
                    {submitted && (
                      <p className="mt-2 text-sm text-gray-300">
                        Model answer: <span className="text-green-400">{q.answer}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={submit}
                disabled={submitted}
                className="rounded-xl bg-purple-500 hover:bg-purple-600 px-6 py-3 font-semibold"
              >
                {submitted ? "Submitted" : "Submit Test"}
              </button>
              {submitted && (
                <div className="text-lg">
                  Score: <span className="font-bold text-green-400">
                    {score}
                  </span>{" "}
                  / {data.mcqs.length + data.trueFalse.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
