// Optional full-screen connect route (/connect-wallet). Not forced into the
// navigation flow — the merchant's existing auth/onboarding stack is untouched.
// Surfaced from the Profile "Wallet Status" card.
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAccount } from 'wagmi';

import { WalletConnectButton } from '@/components/WalletConnectButton';
import { theme } from '@/theme';

export default function ConnectWalletScreen() {
  const router = useRouter();
  const { isConnected } = useAccount();

  // Pop back to wherever the user came from once a wallet is linked.
  useEffect(() => {
    if (isConnected && router.canGoBack()) {
      router.back();
    }
  }, [isConnected, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="wallet-outline" size={72} color={theme.colors.primary} />
        </View>

        <Text style={styles.title}>Connect your wallet</Text>
        <Text style={styles.subtitle}>
          Link an EVM wallet to receive crypto payments on Polygon and settle to your AED bank
          account.
        </Text>

        <WalletConnectButton style={styles.button} />

        <Text style={styles.network}>Polygon Amoy testnet</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    ...theme.shadows.glow,
  },
  title: {
    ...theme.typography.h1,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 36,
    maxWidth: 300,
  },
  button: {
    width: '100%',
    maxWidth: 320,
  },
  network: {
    ...theme.typography.caption,
    marginTop: 20,
  },
});
