// Reusable connect / connected pill backed by Reown AppKit + wagmi.
// - Disconnected: opens the AppKit "Connect" modal.
// - Connected: shows the shortened address and opens the AppKit "Account" modal
//   (network switch + disconnect live there).
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppKit } from '@reown/appkit-react-native';
import { useAccount } from 'wagmi';

import { theme } from '@/theme';

function shortenAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletConnectButton({ style }: { style?: ViewStyle | ViewStyle[] }) {
  const { open } = useAppKit();
  const { address, isConnected, isConnecting } = useAccount();

  if (isConnected) {
    return (
      <TouchableOpacity
        style={[styles.connected, style]}
        onPress={() => open({ view: 'Account' })}
        activeOpacity={0.8}
      >
        <View style={styles.dot} />
        <Text style={styles.connectedText}>{shortenAddress(address)}</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.connect, style]}
      onPress={() => open()}
      activeOpacity={0.85}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <ActivityIndicator color="#000000" size="small" />
      ) : (
        <>
          <Ionicons name="wallet-outline" size={18} color="#000000" />
          <Text style={styles.connectText}>Connect Wallet</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  connect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
  },
  connectText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  connected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.cardElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
  },
  connectedText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontFamily: 'monospace',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
});
