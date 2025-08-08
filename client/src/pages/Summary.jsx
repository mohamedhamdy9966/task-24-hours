import { useState } from "react";

function Summary() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const MAX_CHARS = 3000;

  const truncatedQuestion =
    question.length > MAX_CHARS ? question.slice(0, MAX_CHARS) : question;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
          },
          body: JSON.stringify({ inputs: truncatedQuestion }),
        }
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (Array.isArray(data) && data[0]?.summary_text) {
        const summary = data[0].summary_text;
        setAnswer(summary);
        navigator.clipboard.writeText(summary);
        alert("Answer copied to clipboard!");
      } else {
        setError("Unexpected API response.");
      }
    } catch {
      setError("Error fetching summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Freelancer Q&A Summarizer
          </h1>
          <p className="text-gray-600">
            Enter your question below to get a concise summary
          </p>
        </div>

        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          rows="6"
          placeholder="Paste your content or question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button
          className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 ${
            loading || !question
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
          onClick={handleSubmit}
          disabled={loading || !question}
        >
          {loading ? "Processing..." : "Summarize & Copy to Clipboard"}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {answer && (
          <div className="mt-6 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-800">Summary:</h2>
              <button
                onClick={() => navigator.clipboard.writeText(answer)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Copy Again
              </button>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Summary;
