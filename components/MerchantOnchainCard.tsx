// Profile card that puts the merchant on-chain: reads registration/verification
// status from MerchantRegistry and (when unregistered) lets the merchant call
// registerMerchant() — surfaced through the TxProvider modal + Polygonscan link.
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAccount, useReadContract } from 'wagmi';
import { keccak256, toBytes } from 'viem';

import { Card } from './ui/Card';
import { theme } from '@/theme';
import { CONTRACTS, isContractsConfigured } from '@/lib/contracts';
import { useTx } from '@/provider/TxProvider';
import { useMerchantStore } from '@/stores/merchantStore';

export function MerchantOnchainCard() {
  const { address, isConnected } = useAccount();
  const { settings } = useMerchantStore();
  const { run } = useTx();
  const configured = isContractsConfigured();

  const enabled = Boolean(configured && address);

  const { data: isActive, refetch } = useReadContract({
    address: CONTRACTS.MerchantRegistry.address,
    abi: CONTRACTS.MerchantRegistry.abi,
    functionName: 'isActiveMerchant',
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const { data: isVerified } = useReadContract({
    address: CONTRACTS.MerchantRegistry.address,
    abi: CONTRACTS.MerchantRegistry.abi,
    functionName: 'isVerifiedMerchant',
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const [license, setLicense] = useState('');
  const [iban, setIban] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const register = async () => {
    try {
      setSubmitting(true);
      await run(
        {
          address: CONTRACTS.MerchantRegistry.address,
          abi: CONTRACTS.MerchantRegistry.abi,
          functionName: 'registerMerchant',
          args: [
            settings.businessName || 'Safwah Merchant',
            license || 'TL-DEMO-0001',
            // bank account never goes on-chain as plaintext — store only its hash
            keccak256(toBytes(iban || 'AE000000000000000000000')),
          ],
        },
        { label: 'Register merchant' },
      );
      refetch();
    } catch {
      // error surfaced by the TxProvider modal
    } finally {
      setSubmitting(false);
    }
  };

  if (!configured) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>On-Chain Registration</Text>
        <Text style={styles.muted}>
          Contracts not deployed yet. Add the deployed addresses to .env.local to enable.
        </Text>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>On-Chain Registration</Text>
        <Text style={styles.muted}>Connect a wallet above to register on Polygon.</Text>
      </Card>
    );
  }

  if (isActive) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>On-Chain Registration</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.statusText}>Registered on Polygon</Text>
        </View>
        <Text style={styles.muted}>{isVerified ? 'KYC verified ✓' : 'Verification pending'}</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Register on Polygon</Text>
      <Text style={styles.muted}>Put your merchant profile on-chain so tourists can pay you.</Text>
      <TextInput
        style={styles.input}
        placeholder="Trade license number"
        placeholderTextColor={theme.colors.textMuted}
        value={license}
        onChangeText={setLicense}
      />
      <TextInput
        style={styles.input}
        placeholder="AED bank account (IBAN)"
        placeholderTextColor={theme.colors.textMuted}
        value={iban}
        onChangeText={setIban}
        autoCapitalize="characters"
      />
      <TouchableOpacity style={styles.btn} onPress={register} disabled={submitting} activeOpacity={0.85}>
        {submitting ? <ActivityIndicator color="#000000" /> : <Text style={styles.btnText}>Register on-chain</Text>}
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.md },
  title: { ...theme.typography.h3, marginBottom: theme.spacing.sm },
  muted: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: theme.spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { ...theme.typography.body },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#000000', fontSize: 16, fontWeight: '700' },
});
