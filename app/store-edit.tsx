import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { keccak256, toHex } from 'viem';

import { safwah } from '../theme/safwah';
import { useSettlement } from '../stores/settlementStore';
import { useToast } from '../components/safwah/Toast';
import { useTx } from '../provider/TxProvider';
import { useMerchantOnchain } from '../hooks/useMerchantOnchain';
import { CONTRACTS } from '../lib/contracts';

const FIELDS = [
  { key: 'name', label: 'Business name', icon: 'storefront-outline', placeholder: 'Spice Route Café' },
  { key: 'category', label: 'Category', icon: 'pricetag-outline', placeholder: 'Dining · Restaurant' },
  { key: 'emirate', label: 'Location', icon: 'location-outline', placeholder: 'Dubai, UAE' },
  { key: 'iban', label: 'Payout IBAN', icon: 'business-outline', placeholder: 'AE07 0331 2345 6789 0123 456' },
] as const;

export default function StoreEdit() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { business, setBusiness } = useSettlement();
  const { toast } = useToast();
  const { run } = useTx();
  const { isConnected, active, refetch } = useMerchantOnchain();
  const [form, setForm] = useState({ ...business });

  const save = async () => {
    const name = form.name.trim() || business.name;
    const category = form.category.trim() || business.category;
    const emirate = form.emirate.trim() || business.emirate;
    const iban = form.iban.trim() || business.iban;

    setBusiness({ name, category, emirate, iban });

    // Register the merchant on-chain (MerchantRegistry) the first time, using the
    // entered name + IBAN. The TxProvider modal shows signing → pending → success.
    if (isConnected && !active) {
      const bankAccountHash = keccak256(toHex(iban && iban.trim() ? iban.trim() : 'SAFWAH-DEMO-IBAN'));
      const tradeLicense = `SAFWAH-${name.replace(/\s+/g, '-').toUpperCase()}`;
      try {
        await run(
          {
            address: CONTRACTS.MerchantRegistry.address,
            abi: CONTRACTS.MerchantRegistry.abi,
            functionName: 'registerMerchant',
            args: [name, tradeLicense, bankAccountHash],
          },
          { label: 'Registering' },
        );
        refetch();
      } catch {
        // Error is surfaced by the TxStatusModal; keep the local save so UX isn't lost.
      }
    }

    router.back();
    toast({ title: 'Store updated', description: 'Your store details were saved', variant: 'success' });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <View style={styles.grab} />
        <Text style={styles.title}>Edit store</Text>
        <TouchableOpacity style={styles.close} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="close" size={20} color={safwah.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(form.name || 'S')[0]}</Text>
          </View>
          <Text style={styles.avatarHint}>This is how customers see your store on receipts and the payment screen.</Text>
        </View>

        {FIELDS.map((f) => (
          <View key={f.key} style={styles.field}>
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <View style={styles.inputRow}>
              <Ionicons name={f.icon as never} size={18} color={safwah.colors.textMute} />
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={safwah.colors.textMute}
                value={(form as any)[f.key]}
                onChangeText={(t) => setForm((s) => ({ ...s, [f.key]: t }))}
                autoCapitalize={f.key === 'iban' ? 'characters' : 'words'}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.cta} onPress={save} activeOpacity={0.9}>
          <Ionicons name="checkmark" size={19} color={safwah.colors.onLime} />
          <Text style={styles.ctaText}>Save store</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  header: { alignItems: 'center', marginBottom: 18, paddingHorizontal: 20 },
  grab: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(19,19,22,0.12)', marginBottom: 14 },
  title: { fontFamily: safwah.font.bold, fontSize: 19, color: safwah.colors.text },
  close: { position: 'absolute', right: 20, top: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: safwah.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: safwah.colors.border },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  avatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: safwah.font.bold, fontSize: 26, color: safwah.colors.onLime },
  avatarHint: { flex: 1, fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textDim, lineHeight: 18 },

  field: { marginBottom: 14 },
  fieldLabel: { fontFamily: safwah.font.medium, fontSize: 12.5, color: safwah.colors.textDim, marginBottom: 8, marginLeft: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 11, height: 54, paddingHorizontal: 16, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  input: { flex: 1, fontFamily: safwah.font.medium, fontSize: 15, color: safwah.colors.text },

  cta: { flexDirection: 'row', gap: 9, height: 56, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  ctaText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
});
