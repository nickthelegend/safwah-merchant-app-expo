// Reown AppKit + wagmi configuration for the Safwah merchant app.
// Ported from molfi-expo-app's wallet connector and retargeted at Polygon Amoy,
// the Safwah demo network. This is the single source of truth for the wallet stack;
// `Web3Provider` consumes the exports below.
import { createAppKit } from '@reown/appkit-react-native';
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import { QueryClient } from '@tanstack/react-query';
import { polygon, polygonAmoy } from 'viem/chains';
import * as Clipboard from 'expo-clipboard';

import { storage } from '@/utils/StorageUtil';

// Shared react-query client used by wagmi hooks.
export const queryClient = new QueryClient();

// Reown / WalletConnect project id — create a free one at https://dashboard.reown.com
// Falls back to a shared demo id so the app runs out of the box for the hackathon.
const projectId =
  process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '22260d6680223859f9b07dadfafce02d';

const metadata = {
  name: 'Safwah Merchant',
  description: 'Accept crypto, settle in AED — Safwah merchant POS on Polygon',
  url: 'https://safwah.ae',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
  redirect: {
    // Must match the `scheme` in app.config.js so wallets can deep-link back.
    native: 'irionmerchantapp://',
    universal: 'https://safwah.ae',
  },
};

// Polygon Amoy (testnet, chainId 80002) is the primary network for the Safwah demo;
// Polygon mainnet is included so the same build works against production later.
const networks = [polygonAmoy, polygon] as [typeof polygonAmoy, typeof polygon];

const clipboardClient = {
  setString: async (value: string) => {
    await Clipboard.setStringAsync(value);
  },
};

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const appkit = createAppKit({
  projectId,
  networks,
  adapters: [wagmiAdapter],
  metadata,
  clipboardClient,
  storage,
  defaultNetwork: polygonAmoy,
  enableAnalytics: false,
  features: {
    // Seedless / custodial sign-in (Google, Apple, email …). Requires the same options
    // enabled on the Reown dashboard for this project id.
    email: true,
    socials: ['google', 'apple', 'x', 'discord', 'farcaster'],
  },
});
