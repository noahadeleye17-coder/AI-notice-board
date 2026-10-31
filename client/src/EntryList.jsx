import { useCallback, useEffect, useState } from "react";
import { fetchEntries } from "./entries.js";
import { celoSepolia } from "./chain.js";

const explorer = celoSepolia.blockExplorers.default.url;
const short = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

// Change refreshKey to make the list reload (used later after saving a note).
export default function EntryList({ refreshKey = 0 }) {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(await fetchEntries());
    } catch (err) {
      setError(err.shortMessage || err.message || "Could not read the contract.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <section>
      <div className="list-head">
        <h2>Pinned notices{entries ? ` (${entries.length})` : ""}</h2>
        <button className="ghost" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {entries && entries.length === 0 && <p className="muted">Nothing pinned yet.</p>}

      {entries?.map((entry) => (
        <article className="entry" key={entry.id}>
          <div className="entry-top">
            <p className="entry-text">{entry.text}</p>
            <span className="score" title="AI score out of 10">
              {entry.score}/10
            </span>
          </div>
          {entry.summary && <p className="muted">{entry.summary}</p>}
          <p className="muted small">
            <a href={`${explorer}/address/${entry.author}`} target="_blank" rel="noreferrer">
              {short(entry.author)}
            </a>
            {" · "}
            {new Date(entry.timestamp * 1000).toLocaleString()}
          </p>
        </article>
      ))}
    </section>
  );
}
