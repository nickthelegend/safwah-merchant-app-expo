import React, { createContext, useContext, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

// A realistic-looking address used when exploring without a real wallet (demo mode).
const DEMO_ADDRESS = '0x9F3aC1e74B2d8A6f0C5b1E2d3F4a5B6c7D8e9F01';

type SessionValue = {
  address?: string;
  isConnected: boolean; // real wallet (wagmi)
  isDemo: boolean;
  isAuthed: boolean; // gate: connected OR exploring in demo mode
  enterDemo: () => void;
  exitDemo: () => void;
};

const SessionContext = createContext<SessionValue>({
  isConnected: false,
  isDemo: false,
  isAuthed: false,
  enterDemo: () => {},
  exitDemo: () => {},
});

/// Tracks whether the merchant has "entered" the app — either by connecting a real
/// payout wallet or by choosing demo mode. The tabs are gated behind `isAuthed`.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [isDemo, setIsDemo] = useState(false);

  const value = useMemo<SessionValue>(
    () => ({
      address: address ?? (isDemo ? DEMO_ADDRESS : undefined),
      isConnected,
      isDemo,
      isAuthed: isConnected || isDemo,
      enterDemo: () => setIsDemo(true),
      exitDemo: () => setIsDemo(false),
    }),
    [address, isConnected, isDemo],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
