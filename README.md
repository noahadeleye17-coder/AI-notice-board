# AI Notice Board

A small decentralized notice board for the **Celo Sepolia testnet**. Write a short notice, let Google Gemini rate its clarity and summarise it, then pin it on-chain with your wallet.

- **Client** — React + Vite UI, talks to the chain with [viem](https://viem.sh)
- **Server** — tiny Express proxy that keeps the Gemini API key off the browser
- **Contract** — `NoticeBoard.sol`, an append-only list of scored notices

## How it works

1. You type a notice (max 280 bytes) in the client.
2. The client calls the server's `POST /analyze` endpoint.
3. The server asks Gemini for a `score` (0–10) and a short `summary`, retrying and falling back to a second model if the first is busy.
4. You connect MetaMask, switch to Celo Sepolia, and confirm a transaction that stores the notice, score and summary in the contract.
5. The notice list is read directly from the contract, so anyone can see every pinned notice without a wallet.

The server never touches the chain, and the contract never calls the AI. The AI result is trusted at write time because it is produced by the server, but the contract only enforces size and score bounds.

## Project layout

```
client/                 React + Vite front-end
  src/
    api.js              Calls the server /analyze endpoint
    chain.js            Celo Sepolia chain definition + contract address
    client.js           Read-only viem public client
    contract.js         Contract ABI used by the client
    entries.js          Reads all entries from the contract
    save.js             Writes an entry and waits for confirmation
    wallet.js           Connect / switch network helpers
    App.jsx             Page shell, wallet state, layout
    NoticeForm.jsx      Text input, AI analysis, save flow
    EntryList.jsx       Renders pinned notices
server/                 Express proxy for Gemini
  server.js             API, validation, retries, model fallback
  .env.example          Environment template
contracts/
  NoticeBoard.sol       Solidity contract
```

## Prerequisites

- Node.js 18+ (uses the built-in `fetch` and `AbortSignal.timeout`)
- A [Gemini API key](https://aistudio.google.com/app/apikey)
- [MetaMask](https://metamask.io/download) (or another injected EIP-1193 wallet)
- Testnet CELO for gas — get some from a Celo Sepolia faucet

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env    # Windows: copy .env.example .env
```

Edit `server/.env` and set your key:

```dotenv
GEMINI_API_KEY=your_key_here
# GEMINI_MODEL=gemini-flash-latest
# GEMINI_FALLBACK_MODEL=gemini-flash-lite-latest
# AI_TIMEOUT_MS=12000
# PORT=3001
```

Start it:

```bash
npm run dev     # node --watch, reloads on changes
# or
npm start
```

The server runs on <http://localhost:3001>. Check it with `GET /health`.

### 2. Client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open <http://localhost:5173>. The dev port is pinned to `5173` because the server's CORS allow-list only accepts that origin.

To point the client at a different API host, create `client/.env`:

```dotenv
VITE_API_URL=http://localhost:3001
```

## Contract

`contracts/NoticeBoard.sol` is a single append-only contract:

| Member | Description |
| --- | --- |
| `addEntry(text, score, summary)` | Stores a notice. `text` 1–280 bytes, `summary` ≤ 280 bytes, `score` 0–10. Emits `EntryAdded`. |
| `getEntries()` | Returns every entry (author, text, score, summary, timestamp). |
| `entryCount()` | Number of entries stored. |
| `EntryAdded(id, author, score)` | Event emitted on each write. |

The client is wired to the deployment at `0x096983952dcc77ce37CacD99190C69F899128829` on Celo Sepolia (see `client/src/chain.js`). If you deploy your own copy, update `CONTRACT_ADDRESS` there.

There is no build tooling checked in for the contract. To deploy your own:

1. Open `contracts/NoticeBoard.sol` in [Remix](https://remix.ethereum.org).
2. Compile with Solidity `^0.8.20`.
3. In **Deploy & Run**, choose **Injected Provider - MetaMask** and make sure MetaMask is on **Celo Sepolia**.
4. Deploy, then copy the address into `client/src/chain.js`.
5. Update the ABI in `client/src/contract.js` if you changed the contract.

Celo Sepolia details:

| Field | Value |
| --- | --- |
| Chain ID | `11142220` |
| RPC | `https://forno.celo-sepolia.celo-testnet.org` |
| Explorer | `https://celo-sepolia.blockscout.com` |
| Currency | CELO |

## API

### `GET /health`

```json
{ "ok": true }
```

### `POST /analyze`

Request:

```json
{ "text": "Free yoga in the park on Saturday at 9am." }
```

Response:

```json
{ "score": 8, "summary": "Free outdoor yoga, Saturday 9am, open to all." }
```

Errors:

- `400` — text is empty or longer than 280 characters
- `502` — the AI is unreachable or kept failing

The server retries up to 3 times on `429`, `500`, `503` and `504`, then falls back from `GEMINI_MODEL` to `GEMINI_FALLBACK_MODEL`. Each AI call times out after `AI_TIMEOUT_MS` (12s by default).

## Scripts

| Directory | Command | Purpose |
| --- | --- | --- |
| `server` | `npm start` | Run the API server |
| `server` | `npm run dev` | Run with file watching |
| `client` | `npm run dev` | Start the Vite dev server |
| `client` | `npm run build` | Build for production into `client/dist` |
| `client` | `npm run preview` | Serve the production build locally |

## Notes and limitations

- The contract has no moderation, pagination, or delete — everything ever written stays forever, and `getEntries()` returns the whole list in one call.
- Text limits are enforced in **bytes**, not characters, so emoji and accents count for more than one. The client trims summaries to fit.
- The AI score is advisory; anyone can call `addEntry` directly with any score in range.
- This is a testnet demo. Do not put sensitive information in notices.
