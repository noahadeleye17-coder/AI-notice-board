import { useState } from "react";
import { analyzeText } from "./api.js";
import { byteLength, saveEntry, MAX_BYTES } from "./save.js";
import { celoSepolia } from "./chain.js";
import { walletErrorMessage } from "./wallet.js";

const explorer = celoSepolia.blockExplorers.default.url;

const STATUS_LABELS = {
  analyzing: "Asking the AI (this can take up to a minute when it is busy)...",
  signing: "Confirm the transaction in MetaMask...",
  confirming: "Waiting for the network to confirm...",
};

export default function NoticeForm({ wallet, account, canSave, onSaved }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [lastTx, setLastTx] = useState("");

  const busy = status !== "idle";
  const trimmed = text.trim();
  const size = byteLength(trimmed);
  const valid = size > 0 && size <= MAX_BYTES;

  // Editing the text makes the old AI result stale, so clear it.
  function onChange(e) {
    setText(e.target.value);
    setResult(null);
    setError("");
    setLastTx("");
  }

  async function analyze() {
    setError("");
    setLastTx("");
    setStatus("analyzing");
    try {
      setResult(await analyzeText(trimmed));
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus("idle");
    }
  }

  async function save() {
    setError("");
    setStatus("signing");
    try {
      const hash = await saveEntry({
        wallet,
        account,
        text: trimmed,
        score: result.score,
        summary: result.summary,
        onSubmitted: () => setStatus("confirming"),
      });
      setLastTx(hash);
      setText("");
      setResult(null);
      onSaved();
    } catch (err) {
      setError(walletErrorMessage(err));
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section className="card">
      <label htmlFor="notice" className="muted">
        New notice
      </label>
      <textarea
        id="notice"
        rows={3}
        value={text}
        onChange={onChange}
        disabled={busy}
        placeholder="Write something short, like a notice you would pin on a board..."
      />
      <div className="row between">
        <span className={size > MAX_BYTES ? "small error-text" : "small muted"}>
          {size}/{MAX_BYTES}
        </span>
        <button onClick={analyze} disabled={busy || !valid} className={result ? "ghost" : ""}>
          {result ? "Analyze again" : "Analyze with AI"}
        </button>
      </div>

      {result && (
        <div className="result">
          <span className="score">{result.score}/10</span>
          <p>{result.summary}</p>
          <button onClick={save} disabled={busy || !canSave}>
            Save to chain
          </button>
          {!canSave && <p className="muted small">Connect your wallet on Celo Sepolia to save.</p>}
        </div>
      )}

      {busy && <p className="muted">{STATUS_LABELS[status]}</p>}
      {error && <p className="error">{error}</p>}
      {lastTx && (
        <p className="ok-text">
          Saved on-chain.{" "}
          <a href={`${explorer}/tx/${lastTx}`} target="_blank" rel="noreferrer">
            View transaction
          </a>
        </p>
      )}
    </section>
  );
}
