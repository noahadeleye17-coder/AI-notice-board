import { defineChain, getAddress } from "viem";

export const celoSepolia = defineChain({
  id: 11142220,
  name: "Celo Sepolia Testnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: { default: { http: ["https://forno.celo-sepolia.celo-testnet.org"] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://celo-sepolia.blockscout.com" } },
  testnet: true,
});

// Your deployed NoticeBoard contract. getAddress throws if the address is malformed.
export const CONTRACT_ADDRESS = getAddress("0x096983952dcc77ce37CacD99190C69F899128829");
