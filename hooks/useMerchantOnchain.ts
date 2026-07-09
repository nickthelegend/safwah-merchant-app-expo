// Live on-chain reads for the merchant app — the connected wallet's settled AED balance
// and registration status on Polygon Amoy. Writes go through useTx().run(...).
import { formatUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { CONTRACTS } from '@/lib/contracts';

export function useMerchantOnchain() {
  const { address, isConnected } = useAccount();

  const aedRead = useReadContract({
    address: CONTRACTS.MockAED.address,
    abi: CONTRACTS.MockAED.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 12000 },
  });

  const activeRead = useReadContract({
    address: CONTRACTS.MerchantRegistry.address,
    abi: CONTRACTS.MerchantRegistry.abi,
    functionName: 'isActiveMerchant',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const aed = aedRead.data != null ? +formatUnits(aedRead.data as bigint, 18) : 0;

  return {
    address,
    isConnected,
    aed,
    active: Boolean(activeRead.data),
    refetch: () => { aedRead.refetch(); activeRead.refetch(); },
  };
}
