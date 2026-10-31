import { createPublicClient, http } from "viem";
import { celoSepolia } from "./chain.js";

// Read-only connection to the chain. Reading is free and needs no wallet.
export const publicClient = createPublicClient({
  chain: celoSepolia,
  transport: http(undefined, { timeout: 15000 }),
});
