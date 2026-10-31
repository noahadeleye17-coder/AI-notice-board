// The parts of the NoticeBoard contract the page needs (matches contracts/NoticeBoard.sol).
export const noticeBoardAbi = [
  {
    type: "function",
    name: "addEntry",
    stateMutability: "nonpayable",
    inputs: [
      { name: "text", type: "string" },
      { name: "score", type: "uint8" },
      { name: "summary", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getEntries",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "author", type: "address" },
          { name: "text", type: "string" },
          { name: "score", type: "uint8" },
          { name: "summary", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "entryCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "EntryAdded",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "author", type: "address", indexed: true },
      { name: "score", type: "uint8", indexed: false },
    ],
  },
];
