import { publicClient } from "./client.js";
import { CONTRACT_ADDRESS } from "./chain.js";
import { noticeBoardAbi } from "./contract.js";

// Read every entry from the contract, newest first.
export async function fetchEntries(client = publicClient) {
  const raw = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: noticeBoardAbi,
    functionName: "getEntries",
  });
  return raw
    .map((e, id) => ({
      id,
      author: e.author,
      text: e.text,
      score: Number(e.score),
      summary: e.summary,
      timestamp: Number(e.timestamp),
    }))
    .reverse();
}
