import {
  Address,
  beginCell,
  storeMessage,
  TonClient,
  Transaction,
} from "@ton/ton";
import { useCallback } from "react";

interface WaitForTransactionOptions {
  address: string;
  hash: string;
  refetchInterval?: number;
  refetchLimit?: number;
}

export const useWaitForTransaction = (client: TonClient) => {
  const waitForTransaction = useCallback(
    async (options: WaitForTransactionOptions): Promise<Transaction | null> => {
      const { hash, refetchInterval = 1000, refetchLimit, address } = options;

      return new Promise((resolve) => {
        let refetches = 0;
        const walletAddress = Address.parse(address);
        const interval = setInterval(async () => {
          refetches += 1;

          console.log("waiting transaction...");
          const state = await client.getContractState(walletAddress);
          if (!state || !state.lastTransaction) {
            clearInterval(interval);
            resolve(null);
            return;
          }
          const lastLt = state.lastTransaction.lt;
          const lastHash = state.lastTransaction.hash;
          const lastTx = await client.getTransaction(
            walletAddress,
            lastLt,
            lastHash
          );

          if (lastTx && lastTx.inMessage) {
            const msgCell = beginCell()
              .store(storeMessage(lastTx.inMessage))
              .endCell();

            const inMsgHash = msgCell.hash().toString("base64");
            console.log("InMsgHash", inMsgHash);
            if (inMsgHash === hash) {
              clearInterval(interval);
              resolve(lastTx);
            }
          }
          if (refetchLimit && refetches >= refetchLimit) {
            clearInterval(interval);
            resolve(null);
          }
        }, refetchInterval);
      });
    },
    [client]
  );

  return { waitForTransaction };
};
