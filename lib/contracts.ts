// Safwah contract handles for the merchant app. Addresses come from EXPO_PUBLIC_*
// env (filled after `forge script Deploy`); ABIs are generated from the Foundry build.
import type { Abi } from 'viem';
import { polygonAmoy } from 'viem/chains';

import TokenRegistryAbi from './abis/TokenRegistry.json';
import MockAEDAbi from './abis/MockAED.json';
import MockUSDTAbi from './abis/MockUSDT.json';
import MerchantRegistryAbi from './abis/MerchantRegistry.json';
import VATTrackerAbi from './abis/VATTracker.json';
import LoyaltyMinterAbi from './abis/LoyaltyMinter.json';
import SafwahSwapAbi from './abis/SafwahSwap.json';
import SettlementRouterAbi from './abis/SettlementRouter.json';
import SafwahPaymentAbi from './abis/SafwahPayment.json';

const env = process.env;
const addr = (v?: string) => (v ?? '') as `0x${string}`;

export const safwahChain = polygonAmoy;
export const safwahChainId = polygonAmoy.id; // 80002

export const CONTRACTS = {
  TokenRegistry: {
    address: addr(env.EXPO_PUBLIC_TOKEN_REGISTRY_ADDRESS),
    abi: TokenRegistryAbi as unknown as Abi,
  },
  MockAED: { address: addr(env.EXPO_PUBLIC_MOCK_AED_ADDRESS), abi: MockAEDAbi as unknown as Abi },
  MockUSDT: { address: addr(env.EXPO_PUBLIC_MOCK_USDT_ADDRESS), abi: MockUSDTAbi as unknown as Abi },
  MerchantRegistry: {
    address: addr(env.EXPO_PUBLIC_MERCHANT_REGISTRY_ADDRESS),
    abi: MerchantRegistryAbi as unknown as Abi,
  },
  VATTracker: { address: addr(env.EXPO_PUBLIC_VAT_TRACKER_ADDRESS), abi: VATTrackerAbi as unknown as Abi },
  LoyaltyMinter: {
    address: addr(env.EXPO_PUBLIC_LOYALTY_MINTER_ADDRESS),
    abi: LoyaltyMinterAbi as unknown as Abi,
  },
  SafwahSwap: { address: addr(env.EXPO_PUBLIC_SAFWAH_SWAP_ADDRESS), abi: SafwahSwapAbi as unknown as Abi },
  SettlementRouter: {
    address: addr(env.EXPO_PUBLIC_SETTLEMENT_ROUTER_ADDRESS),
    abi: SettlementRouterAbi as unknown as Abi,
  },
  SafwahPayment: {
    address: addr(env.EXPO_PUBLIC_SAFWAH_PAYMENT_ADDRESS),
    abi: SafwahPaymentAbi as unknown as Abi,
  },
} as const;

/// True once the deployed addresses have been wired into the env.
export const isContractsConfigured = () =>
  Boolean(env.EXPO_PUBLIC_MERCHANT_REGISTRY_ADDRESS && env.EXPO_PUBLIC_SAFWAH_PAYMENT_ADDRESS);
