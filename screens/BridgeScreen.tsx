import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { safwah } from '../theme/safwah';
import { fmt, timeAgo } from '../lib/fmt';
import { useSettlement } from '../stores/settlementStore';
import { useToast } from '../components/safwah/Toast';

export default function BridgeScreen() {
  const insets = useSafeAreaInsets();
  const { available, business, payouts, withdraw } = useSettlement();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<{ amt: number } | null>(null);

  const amt = parseFloat(amount) || 0;
  const insufficient = amt > available;
  const canWithdraw = amt > 0 && !insufficient;

  const doWithdraw = () => {
    if (!canWithdraw) return;
    withdraw(amt);
    setDone({ amt });
    setAmount('');
    toast({ title: 'Withdrawal sent', description: `AED ${fmt(amt)} to ${business.iban.slice(-7).trim()}`, variant: 'success' });
  };

  if (done) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Ionicons name="arrow-up" size={44} color={safwah.colors.onLime} />
          </View>
          <Text style={styles.doneAmt}>AED {fmt(done.amt)}</Text>
          <Text style={styles.doneSub}>On its way to {business.iban.slice(-7).trim()}</Text>
          <Text style={styles.doneEta}>Arrives in your bank within 1 business day</Text>
          <TouchableOpacity style={styles.doneCta} onPress={() => setDone(null)} activeOpacity={0.9}>
            <Text style={styles.doneCtaText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 130 }}
      >
        <Text style={styles.title}>Settle</Text>
        <Text style={styles.subtitle}>Withdraw your AED to a UAE bank account</Text>

        <View style={styles.balCard}>
          <Text style={styles.balLabel}>Available to withdraw</Text>
          <View style={styles.balRow}>
            <Text style={styles.balCcy}>AED</Text>
            <Text style={styles.balValue}>{fmt(available)}</Text>
          </View>
          <Text style={styles.balSub}>Settled instantly from every crypto payment · no rolling reserve</Text>
        </View>

        <View style={styles.field}>
          <View style={styles.fieldTop}>
            <Text style={styles.fieldLabel}>Amount</Text>
            <TouchableOpacity onPress={() => setAmount(String(Math.floor(available)))} activeOpacity={0.7}>
              <Text style={styles.maxBtn}>Withdraw all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountCcy}>AED</Text>
            <TextInput
              style={[styles.amountInput, insufficient && { color: safwah.colors.danger }]}
              placeholder="0.00"
              placeholderTextColor={safwah.colors.textMute}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        <View style={styles.bankRow}>
          <View style={styles.bankIcon}>
            <Ionicons name="business-outline" size={18} color={safwah.colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankName}>Emirates NBD · Business</Text>
            <Text style={styles.bankIban}>{business.iban}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={safwah.colors.emerald} />
        </View>

        <TouchableOpacity style={[styles.cta, !canWithdraw && styles.ctaDisabled]} onPress={doWithdraw} disabled={!canWithdraw} activeOpacity={0.9}>
          <Ionicons name="arrow-up-circle" size={19} color={canWithdraw ? safwah.colors.onLime : safwah.colors.textMute} />
          <Text style={[styles.ctaText, !canWithdraw && { color: safwah.colors.textMute }]}>
            {insufficient ? 'Amount exceeds balance' : 'Withdraw to bank'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.feeNote}>0% Safwah fee · standard bank transfer</Text>

        {payouts.length > 0 && (
          <>
            <Text style={styles.section}>Recent payouts</Text>
            {payouts.map((p) => (
              <View key={p.id} style={styles.payoutRow}>
                <View style={styles.payoutIcon}>
                  <Ionicons name="arrow-up" size={15} color={safwah.colors.emerald} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payoutName}>Bank transfer</Text>
                  <Text style={styles.payoutMeta}>{p.iban.slice(-7).trim()} · {timeAgo(p.ts)}</Text>
                </View>
                <Text style={styles.payoutAmt}>− AED {fmt(p.amountAED)}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bg },
  title: { fontFamily: safwah.font.bold, fontSize: 27, color: safwah.colors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textDim, marginTop: 5, marginBottom: 18 },

  balCard: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, padding: 20 },
  balLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  balRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 10 },
  balCcy: { fontFamily: safwah.font.semibold, fontSize: 17, color: safwah.colors.textDim, marginBottom: 7 },
  balValue: { fontFamily: safwah.font.monoBold, fontSize: 40, color: safwah.colors.text, letterSpacing: -1 },
  balSub: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textMute, marginTop: 8 },

  field: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, padding: 18, marginTop: 14 },
  fieldTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  fieldLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  maxBtn: { fontFamily: safwah.font.semibold, fontSize: 12.5, color: safwah.colors.lime },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amountCcy: { fontFamily: safwah.font.semibold, fontSize: 22, color: safwah.colors.textDim },
  amountInput: { flex: 1, fontFamily: safwah.font.monoBold, fontSize: 32, color: safwah.colors.text, padding: 0 },

  bankRow: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.md, padding: 14, marginTop: 12 },
  bankIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: safwah.colors.cardSoft, alignItems: 'center', justifyContent: 'center' },
  bankName: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.text },
  bankIban: { fontFamily: safwah.font.mono, fontSize: 11.5, color: safwah.colors.textMute, marginTop: 3 },

  cta: { flexDirection: 'row', gap: 9, height: 56, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  ctaDisabled: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  ctaText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
  feeNote: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textMute, textAlign: 'center', marginTop: 12 },

  section: { fontFamily: safwah.font.semibold, fontSize: 13, color: safwah.colors.textMute, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 28, marginBottom: 6 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: safwah.colors.hairline },
  payoutIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: safwah.colors.emeraldWash, alignItems: 'center', justifyContent: 'center' },
  payoutName: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.text },
  payoutMeta: { fontFamily: safwah.font.mono, fontSize: 11, color: safwah.colors.textMute, marginTop: 2 },
  payoutAmt: { fontFamily: safwah.font.monoBold, fontSize: 14, color: safwah.colors.text },

  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, paddingBottom: 80 },
  doneCircle: { width: 92, height: 92, borderRadius: 46, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  doneAmt: { fontFamily: safwah.font.monoBold, fontSize: 36, color: safwah.colors.text, letterSpacing: -1 },
  doneSub: { fontFamily: safwah.font.mono, fontSize: 14, color: safwah.colors.textDim, marginTop: 10 },
  doneEta: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textMute, marginTop: 6, textAlign: 'center' },
  doneCta: { height: 54, paddingHorizontal: 56, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  doneCtaText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
});
