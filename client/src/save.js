import { CONTRACT_ADDRESS } from "./chain.js";
import { noticeBoardAbi } from "./contract.js";
import { publicClient } from "./client.js";

export const MAX_BYTES = 280; // the contract limits text and summary to 280 bytes
export const byteLength = (str) => new TextEncoder().encode(str).length;

// Emoji and accents use more than one byte, so trim the summary until it fits the contract.
export function fitBytes(str, max = MAX_BYTES) {
  let out = str;
  while (byteLength(out) > max) out = out.slice(0, -1);
  return out;
}

// Send the note to the contract and wait until it is confirmed. Returns the transaction hash.
export async function saveEntry({ wallet, account, text, score, summary, onSubmitted, client = publicClient }) {
  const hash = await wallet.writeContract({
    address: CONTRACT_ADDRESS,
    abi: noticeBoardAbi,
    functionName: "addEntry",
    args: [text, score, fitBytes(summary)],
    account,
  });
  onSubmitted?.(hash);

  const receipt = await client.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("The transaction was reverted on-chain.");
  return hash;
}
