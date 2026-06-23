import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

import { safwah } from '../theme/safwah';
import { fmt } from '../lib/fmt';
import { PayToken, TOKEN_META, useSettlement, vatOf } from '../stores/settlementStore';
import { useToast } from '../components/safwah/Toast';

const TOKENS: PayToken[] = ['USDT', 'ETH', 'AED'];
type Stage = 'entry' | 'qr' | 'done';

export default function POSScreen() {
  const insets = useSafeAreaInsets();
  const { business, acceptPayment } = useSettlement();
  const { toast } = useToast();
  const [amount, setAmount] = useState('0');
  const [token, setToken] = useState<PayToken>('USDT');
  const [stage, setStage] = useState<Stage>('entry');
  const [received, setReceived] = useState(0);

  const amt = parseFloat(amount) || 0;
  const tokenAmount = amt / TOKEN_META[token].aed;
  const canCharge = amt > 0;

  const press = (k: string) => {
    setAmount((cur) => {
      if (k === '⌫') return cur.length <= 1 ? '0' : cur.slice(0, -1);
      if (k === '.') return cur.includes('.') ? cur : cur + '.';
      if (cur.includes('.') && cur.split('.')[1].length >= 2) return cur; // max 2 dp
      if (cur === '0' && k !== '.') return k;
      return cur + k;
    });
  };

  const charge = () => canCharge && setStage('qr');
  const markPaid = () => {
    acceptPayment(amt, token, token === 'AED' ? 'Walk-in · cash' : 'Tourist · scan');
    setReceived(amt);
    setStage('done');
    toast({ title: 'Payment received', description: `AED ${fmt(amt)} settled to your balance`, variant: 'success' });
  };
  const reset = () => {
    setAmount('0');
    setToken('USDT');
    setStage('entry');
  };

  const payUri = `safwah://pay?to=${encodeURIComponent(business.name)}&amountAED=${amt.toFixed(2)}&token=${token}&tokenAmount=${tokenAmount.toFixed(token === 'ETH' ? 5 : 2)}`;

  // ---- DONE ----
  if (stage === 'done') {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
        <View style={styles.doneWrap}>
          <View style={styles.doneCircle}>
            <Ionicons name="checkmark" size={48} color={safwah.colors.onLime} />
          </View>
          <Text style={styles.doneAmt}>AED {fmt(received)}</Text>
          <Text style={styles.doneSub}>Received & settled to your balance</Text>
          <View style={styles.doneCard}>
            <Row k="Paid in" v={`${fmt(tokenAmount, token === 'ETH' ? 5 : 2)} ${token}`} />
            <Row k="VAT (5%)" v={`AED ${fmt(vatOf(received))}`} />
            <Row k="Network" v="Polygon Amoy" last />
          </View>
          <TouchableOpacity style={styles.doneCta} onPress={reset} activeOpacity={0.9}>
            <Ionicons name="add" size={20} color={safwah.colors.onLime} />
            <Text style={styles.doneCtaText}>New charge</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---- QR ----
  if (stage === 'qr') {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} onPress={() => setStage('entry')} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color={safwah.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan to pay</Text>
          <View style={{ width: 38 }} />
        </View>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 24, paddingBottom: 130 }}>
          <Text style={styles.qrAmount}>AED {fmt(amt)}</Text>
          <Text style={styles.qrEq}>≈ {fmt(tokenAmount, token === 'ETH' ? 5 : 2)} {token}</Text>

          <View style={styles.qrCard}>
            <QRCode value={payUri} size={210} backgroundColor="#ffffff" color="#0a0a0a" />
          </View>

          <View style={styles.qrHint}>
            <Ionicons name="phone-portrait-outline" size={16} color={safwah.colors.textDim} />
            <Text style={styles.qrHintText}>Customer scans with the SAFWAH app · pays in {token}, you receive AED</Text>
          </View>

          <TouchableOpacity style={styles.markBtn} onPress={markPaid} activeOpacity={0.9}>
            <Ionicons name="checkmark-circle" size={19} color={safwah.colors.onLime} />
            <Text style={styles.markBtnText}>Mark as paid</Text>
          </TouchableOpacity>
          <Text style={styles.simNote}>Demo: confirms the on-chain payment for you</Text>
        </ScrollView>
      </View>
    );
  }

  // ---- ENTRY ----
  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <View style={{ width: 38 }} />
        <Text style={styles.title}>Charge</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.amountBlock}>
        <Text style={styles.amountLabel}>Amount to charge</Text>
        <View style={styles.amountLine}>
          <Text style={styles.amountCcy}>AED</Text>
          <Text style={styles.bigAmount}>{amount}</Text>
        </View>
        <Text style={styles.amountEq}>Customer pays ≈ {fmt(tokenAmount, token === 'ETH' ? 5 : 2)} {token} · VAT AED {fmt(vatOf(amt))}</Text>
      </View>

      <View style={styles.tokenRow}>
        {TOKENS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tokenChip, token === t && { borderColor: TOKEN_META[t].color, backgroundColor: safwah.colors.cardSoft }]}
            onPress={() => setToken(t)}
            activeOpacity={0.85}
          >
            <View style={[styles.tokenDot, { backgroundColor: TOKEN_META[t].color }]} />
            <Text style={[styles.tokenChipText, token === t && { color: safwah.colors.text }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.numpad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', '⌫']].map((row, i) => (
          <View key={i} style={styles.numRow}>
            {row.map((k) => (
              <TouchableOpacity key={k} style={styles.key} onPress={() => press(k)} activeOpacity={0.6}>
                {k === '⌫' ? (
                  <Ionicons name="backspace-outline" size={24} color={safwah.colors.text} />
                ) : (
                  <Text style={styles.keyText}>{k}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 100 }}>
        <TouchableOpacity style={[styles.chargeBtn, !canCharge && styles.chargeDisabled]} onPress={charge} disabled={!canCharge} activeOpacity={0.9}>
          <Ionicons name="qr-code" size={19} color={canCharge ? safwah.colors.onLime : safwah.colors.textMute} />
          <Text style={[styles.chargeText, !canCharge && { color: safwah.colors.textMute }]}>
            {canCharge ? `Charge AED ${fmt(amt)}` : 'Enter an amount'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <View style={[styles.kvRow, !last && styles.kvBorder]}>
      <Text style={styles.kvK}>{k}</Text>
      <Text style={styles.kvV}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginBottom: 6 },
  back: { width: 38, height: 38, borderRadius: 12, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: safwah.font.bold, fontSize: 18, color: safwah.colors.text },

  amountBlock: { alignItems: 'center', paddingTop: 18, paddingBottom: 10 },
  amountLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  amountLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10 },
  amountCcy: { fontFamily: safwah.font.semibold, fontSize: 20, color: safwah.colors.textDim, marginTop: 14 },
  bigAmount: { fontFamily: safwah.font.monoBold, fontSize: 56, color: safwah.colors.text, letterSpacing: -1.5 },
  amountEq: { fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textMute, marginTop: 8 },

  tokenRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 36, marginTop: 8, marginBottom: 6, justifyContent: 'center' },
  tokenChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 9, paddingHorizontal: 16, borderRadius: safwah.radius.pill, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  tokenDot: { width: 9, height: 9, borderRadius: 5 },
  tokenChipText: { fontFamily: safwah.font.semibold, fontSize: 13.5, color: safwah.colors.textDim },

  numpad: { paddingHorizontal: 24, marginTop: 6 },
  numRow: { flexDirection: 'row', justifyContent: 'space-between' },
  key: { flex: 1, height: 62, alignItems: 'center', justifyContent: 'center', margin: 4, borderRadius: safwah.radius.md },
  keyText: { fontFamily: safwah.font.semibold, fontSize: 26, color: safwah.colors.text },

  chargeBtn: { flexDirection: 'row', gap: 9, height: 56, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center' },
  chargeDisabled: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  chargeText: { fontFamily: safwah.font.bold, fontSize: 16.5, color: safwah.colors.onLime },

  // QR
  qrAmount: { fontFamily: safwah.font.monoBold, fontSize: 36, color: safwah.colors.text, marginTop: 8, letterSpacing: -1 },
  qrEq: { fontFamily: safwah.font.medium, fontSize: 14, color: safwah.colors.emerald, marginTop: 4 },
  qrCard: { backgroundColor: '#fff', padding: 20, borderRadius: safwah.radius.lg, marginTop: 26 },
  qrHint: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 22, paddingHorizontal: 10 },
  qrHintText: { flex: 1, fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textDim, lineHeight: 18 },
  markBtn: { flexDirection: 'row', gap: 9, height: 54, paddingHorizontal: 40, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  markBtnText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
  simNote: { fontFamily: safwah.font.regular, fontSize: 11.5, color: safwah.colors.textMute, marginTop: 12 },

  // Done
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingBottom: 80 },
  doneCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  doneAmt: { fontFamily: safwah.font.monoBold, fontSize: 38, color: safwah.colors.text, letterSpacing: -1 },
  doneSub: { fontFamily: safwah.font.regular, fontSize: 14, color: safwah.colors.textDim, marginTop: 8 },
  doneCard: { width: '100%', backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, paddingHorizontal: 18, marginTop: 26 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  kvBorder: { borderBottomWidth: 1, borderBottomColor: safwah.colors.hairline },
  kvK: { fontFamily: safwah.font.regular, fontSize: 13.5, color: safwah.colors.textDim },
  kvV: { fontFamily: safwah.font.semibold, fontSize: 13.5, color: safwah.colors.text },
  doneCta: { flexDirection: 'row', gap: 8, height: 54, paddingHorizontal: 44, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  doneCtaText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
});
