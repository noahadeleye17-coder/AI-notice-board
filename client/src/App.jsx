import { useCallback, useEffect, useMemo, useState } from "react";
import { createWalletClient, custom } from "viem";
import { celoSepolia, CONTRACT_ADDRESS } from "./chain.js";
import { connectWallet, switchToCelo, walletErrorMessage } from "./wallet.js";

const short = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;
const explorer = celoSepolia.blockExplorers.default.url;

export default function App() {
  const provider = window.ethereum;
  const wallet = useMemo(
    () => (provider ? createWalletClient({ chain: celoSepolia, transport: custom(provider) }) : null),
    [provider]
  );

  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshChain = useCallback(async () => {
    if (wallet) setChainId(await wallet.getChainId());
  }, [wallet]);

  // On load: pick up an already-connected account (no popup) and listen for changes.
  useEffect(() => {
    if (!wallet) return;
    wallet.getAddresses().then((a) => setAccount(a[0] ?? null)).catch(() => {});
    refreshChain().catch(() => {});

    const onAccounts = (accounts) => setAccount(accounts[0] ?? null);
    const onChain = () => refreshChain().catch(() => {});
    provider.on("accountsChanged", onAccounts);
    provider.on("chainChanged", onChain);
    return () => {
      provider.removeListener("accountsChanged", onAccounts);
      provider.removeListener("chainChanged", onChain);
    };
  }, [wallet, provider, refreshChain]);

  async function run(action) {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(walletErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const connect = () =>
    run(async () => {
      setAccount(await connectWallet(wallet));
      await refreshChain();
    });

  const switchNetwork = () =>
    run(async () => {
      await switchToCelo(wallet);
      await refreshChain();
    });

  const onRightNetwork = chainId === celoSepolia.id;

  return (
    <main className="page">
      <h1>AI Notice Board</h1>
      <p className="muted">Write a notice, let the AI rate it, and pin it on the Celo Sepolia testnet.</p>

      <section className="card">
        {!wallet ? (
          <p>
            No wallet found. Install <a href="https://metamask.io/download" target="_blank" rel="noreferrer">MetaMask</a> and
            reload this page.
          </p>
        ) : !account ? (
          <button onClick={connect} disabled={busy}>
            {busy ? "Waiting for wallet..." : "Connect wallet"}
          </button>
        ) : (
          <>
            <div className="row">
              <span className="muted">Account</span>
              <code title={account}>{short(account)}</code>
            </div>
            <div className="row">
              <span className="muted">Network</span>
              {onRightNetwork ? (
                <span className="pill ok">{celoSepolia.name}</span>
              ) : (
                <>
                  <span className="pill warn">Wrong network{chainId ? ` (${chainId})` : ""}</span>
                  <button onClick={switchNetwork} disabled={busy}>
                    Switch to Celo Sepolia
                  </button>
                </>
              )}
            </div>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>

      <p className="muted small">
        Contract:{" "}
        <a href={`${explorer}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
          {short(CONTRACT_ADDRESS)}
        </a>
      </p>
    </main>
  );
}
