const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3001";

// Ask the server (which asks Gemini) to score a notice. Returns { score, summary }.
export async function analyzeText(text, fetchFn = globalThis.fetch) {
  let res;
  try {
    res = await fetchFn(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(65000), // the server gives up on the AI after ~50s
    });
  } catch (err) {
    if (err.name === "TimeoutError") throw new Error("The AI took too long. Please try again.");
    throw new Error("Can't reach the server. Is it running on port 3001?");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "The AI request failed.");
  return data;
}
