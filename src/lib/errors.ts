const ERROR_MESSAGES: Record<string, string> = {
  ConfigAlreadyExists:
    "A recovery configuration already exists. Delete your existing configuration before registering a new one.",
  NoConfigExists: "No recovery configuration found for this address.",
  ClaimPending:
    "A claim is currently pending. Configuration changes are disabled until the claim is resolved.",
  InvalidSplits: "Heir splits must sum to exactly 10,000 basis points (100%).",
  ArrayLengthMismatch:
    "Heirs and splits must have the same length, with between 1 and 10 heirs.",
  TokenAlreadyRegistered:
    "This token is already registered. Deregister it first before registering again with a new amount.",
  TokenNotRegistered: "This token is not registered in your recovery configuration.",
  ClaimTooEarly:
    "The inactivity period has not elapsed yet. The owner must remain inactive longer before a claim can be initiated.",
  ClaimAlreadyPending: "A claim is already pending for this owner.",
  NotAHeir: "Your wallet is not a registered heir for this owner.",
  GracePeriodActive:
    "The grace period is still active. Wait for it to elapse before executing the claim.",
  GracePeriodInActive:
    "The grace period has already elapsed. You can no longer cancel this claim.",
  NoPendingClaim: "There is no pending claim for this owner.",
  Unauthorized: "Unauthorized vault operation.",
};

export function getErrorMessage(error: unknown): string {
  if (!error) return "Transaction failed.";

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);

  for (const [name, friendly] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(name)) return friendly;
  }

  if (message.includes("User rejected")) {
    return "Transaction was rejected in your wallet.";
  }

  if (message.includes("Insufficient vault balance")) {
    return "Withdrawal amount exceeds your vault balance.";
  }

  return message.length > 200 ? "Transaction failed. Please try again." : message;
}
