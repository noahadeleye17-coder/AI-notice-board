import { celoSepolia } from "./chain.js";

function isRejected(err) {
  return err?.code === 4001 || err?.cause?.code === 4001 || err?.name === "UserRejectedRequestError";
}

// Ask the wallet to connect and return the first account.
export async function connectWallet(wallet) {
  const [address] = await wallet.requestAddresses();
  return address ?? null;
}

// Switch to Celo Sepolia. If the wallet doesn't know the network yet, add it first.
export async function switchToCelo(wallet) {
  try {
    await wallet.switchChain({ id: celoSepolia.id });
  } catch (err) {
    if (isRejected(err)) throw err;
    await wallet.addChain({ chain: celoSepolia });
  }
}

export function walletErrorMessage(err) {
  if (isRejected(err)) return "You rejected the request in your wallet.";
  return err?.shortMessage || err?.message || "Something went wrong with the wallet.";
}
