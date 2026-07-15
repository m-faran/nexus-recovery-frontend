export const nexusRecoveryVaultAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_nexusRecovery", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nexusRecovery",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVaultBalance",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  { type: "error", name: "Unauthorized", inputs: [] },
] as const;
