"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { getErrorMessage } from "@/lib/errors";

type TxOptions = {
  successMessage?: string;
  pendingMessage?: string;
  onSuccess?: () => void;
};

export function useContractTx() {
  const queryClient = useQueryClient();
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const execute = useCallback(
    async (
      params: Parameters<typeof writeContractAsync>[0],
      options?: TxOptions,
    ) => {
      const pendingMessage = options?.pendingMessage ?? "Transaction submitted…";
      const successMessage = options?.successMessage ?? "Transaction confirmed.";

      try {
        toast.loading(pendingMessage, { id: "contract-tx" });
        const hash = await writeContractAsync(params);
        toast.loading("Waiting for confirmation…", { id: "contract-tx" });

        const { waitForTransactionReceipt } = await import("wagmi/actions");
        const { wagmiConfig } = await import("@/lib/wagmi");
        await waitForTransactionReceipt(wagmiConfig, { hash });

        toast.success(successMessage, { id: "contract-tx" });
        await queryClient.invalidateQueries();
        options?.onSuccess?.();
        return hash;
      } catch (error) {
        toast.error(getErrorMessage(error), { id: "contract-tx" });
        throw error;
      }
    },
    [queryClient, writeContractAsync],
  );

  return { execute, isPending: isWritePending };
}
