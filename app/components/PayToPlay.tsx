import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { LifecycleStatus, TransactionStatusAction } from "@coinbase/onchainkit/transaction";

import { TransactionStatusLabel } from "@coinbase/onchainkit/transaction";

import { TransactionStatus } from "@coinbase/onchainkit/transaction";

import { Transaction, TransactionSponsor, TransactionButton} from "@coinbase/onchainkit/transaction";
import { useCallback, useMemo } from "react";
import { defineChain, encode, getContract } from "thirdweb";
import { CHAIN, client, ENTRY_FEE, FINGER_ON_BUTTON_CONTRACT_ADDRESS } from "../constants";
import { deposit } from "@/thirdweb/84532/0xe94e6b6978298b7542d9e316772fb365a4bdb1cc";
import { parseEther } from "viem";

export const PayToPlay = ({ gameId, onSuccess }: { gameId: string, onSuccess: () => void; }) => {
  const { context } = useMiniKit();

  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    console.log('LifecycleStatus', status);
    if (status.statusName === "success") {
      onSuccess();
    }
  }, [onSuccess]);

  const calls = useMemo(async () => {
    const TEST_FID = 1;
    const contract = getContract({
      client,
      chain: defineChain(CHAIN.id),
      address: FINGER_ON_BUTTON_CONTRACT_ADDRESS,
    });
    const create = deposit({
      contract,
      fid: BigInt(context?.user?.fid ?? TEST_FID),
      gameId,
    })
    const data = await encode(create);
    
    return [{
      to: FINGER_ON_BUTTON_CONTRACT_ADDRESS as `0x${string}`,
      data,
      value: parseEther(ENTRY_FEE.toString())
    }];

  }, [context?.user?.fid, gameId]);
  return (
    <Transaction
      chainId={CHAIN.id} 
      calls={calls} 
      onStatus={handleOnStatus} 
    >
      <TransactionButton text="Pay to Play" />
      <TransactionSponsor />
      <TransactionStatus>
        <TransactionStatusLabel />
        <TransactionStatusAction />
      </TransactionStatus>
    </Transaction> 
  )
};