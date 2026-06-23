// Wraps the app with the wallet stack: wagmi -> react-query -> Reown AppKit.
// Drop this around the existing provider tree in app/_layout.tsx; it does NOT
// touch AuthProvider, the printer bootstrap, or any POS logic.
import React from 'react';
import { View } from 'react-native';
import { AppKit, AppKitProvider } from '@reown/appkit-react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { appkit, queryClient, wagmiAdapter } from '@/lib/appkit';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider instance={appkit}>
          {children}
          {/* Android modal workaround — render AppKit inside an absolute overlay so the
              wallet modal sits above the rest of the UI.
              https://github.com/expo/expo/issues/32991#issuecomment-2489620459 */}
          <View
            style={{ position: 'absolute', height: '100%', width: '100%' }}
            pointerEvents="box-none"
          >
            <AppKit />
          </View>
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
