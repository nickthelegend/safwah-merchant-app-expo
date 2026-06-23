import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { safwah } from '../theme/safwah';
import { fmt, timeAgo } from '../lib/fmt';
import { PayToken, TOKEN_META, useSettlement, vatOf } from '../stores/settlementStore';

const FILTERS: ('All' | PayToken)[] = ['All', 'USDT', 'ETH', 'AED'];
const tokenIcon = (t: string) => (t === 'AED' ? 'cash' : t === 'ETH' ? 'diamond' : 'logo-usd');

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { sales } = useSettlement();
  const [filter, setFilter] = useState<'All' | PayToken>('All');

  const totalReceived = useMemo(() => sales.reduce((s, t) => s + t.amountAED, 0), [sales]);
  const totalVat = useMemo(() => sales.reduce((s, t) => s + vatOf(t.amountAED), 0), [sales]);
  const shown = filter === 'All' ? sales : sales.filter((s) => s.token === filter);

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 130 }}
      >
        <Text style={styles.title}>Sales</Text>
        <Text style={styles.subtitle}>Auto-settled to AED · recorded on Polygon Amoy</Text>

        <View style={styles.summary}>
          <View style={styles.sumMain}>
            <Text style={styles.sumLabel}>Total received</Text>
            <View style={styles.sumRow}>
              <Text style={styles.sumCcy}>AED</Text>
              <Text style={styles.sumValue}>{fmt(totalReceived)}</Text>
            </View>
          </View>
          <View style={styles.sumSplit}>
            <View style={styles.sumItem}>
              <Text style={styles.sumItemV}>{sales.length}</Text>
              <Text style={styles.sumItemL}>sales</Text>
            </View>
            <View style={styles.sumDivider} />
            <View style={styles.sumItem}>
              <Text style={styles.sumItemV}>{fmt(totalVat, 0)}</Text>
              <Text style={styles.sumItemL}>VAT AED</Text>
            </View>
          </View>
        </View>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterActive]} onPress={() => setFilter(f)} activeOpacity={0.8}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {shown.map((s) => (
          <View key={s.id} style={styles.row}>
            <View style={[styles.icon, { borderColor: TOKEN_META[s.token].color }]}>
              <Ionicons name={tokenIcon(s.token) as never} size={16} color={TOKEN_META[s.token].color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{s.customer}</Text>
              <Text style={styles.meta}>
                {fmt(s.tokenAmount, s.token === 'ETH' ? 4 : 2)} {s.token} · {timeAgo(s.ts)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amt}>+ AED {fmt(s.amountAED)}</Text>
              <View style={styles.settledPill}>
                <View style={styles.settledDot} />
                <Text style={styles.settledText}>Settled</Text>
              </View>
            </View>
          </View>
        ))}

        {shown.length === 0 && <Text style={styles.empty}>No {filter} payments yet.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bg },
  title: { fontFamily: safwah.font.bold, fontSize: 27, color: safwah.colors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textDim, marginTop: 5, marginBottom: 18 },

  summary: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, padding: 18 },
  sumMain: {},
  sumLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  sumRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 },
  sumCcy: { fontFamily: safwah.font.semibold, fontSize: 16, color: safwah.colors.textDim, marginBottom: 6 },
  sumValue: { fontFamily: safwah.font.monoBold, fontSize: 36, color: safwah.colors.text, letterSpacing: -1 },
  sumSplit: { flexDirection: 'row', alignItems: 'center', marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: safwah.colors.hairline },
  sumItem: { flex: 1, alignItems: 'center' },
  sumItemV: { fontFamily: safwah.font.monoBold, fontSize: 18, color: safwah.colors.text },
  sumItemL: { fontFamily: safwah.font.regular, fontSize: 11.5, color: safwah.colors.textMute, marginTop: 3 },
  sumDivider: { width: 1, height: 32, backgroundColor: safwah.colors.hairline },

  filters: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 8 },
  filterChip: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: safwah.radius.pill, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  filterActive: { backgroundColor: safwah.colors.lime, borderColor: safwah.colors.lime },
  filterText: { fontFamily: safwah.font.semibold, fontSize: 12.5, color: safwah.colors.textDim },
  filterTextActive: { color: safwah.colors.onLime },

  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: safwah.colors.hairline },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: safwah.colors.card, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: safwah.font.semibold, fontSize: 14.5, color: safwah.colors.text },
  meta: { fontFamily: safwah.font.mono, fontSize: 11, color: safwah.colors.textMute, marginTop: 2 },
  amt: { fontFamily: safwah.font.monoBold, fontSize: 14.5, color: safwah.colors.emerald },
  settledPill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  settledDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: safwah.colors.emerald },
  settledText: { fontFamily: safwah.font.regular, fontSize: 10.5, color: safwah.colors.textDim },
  empty: { fontFamily: safwah.font.regular, fontSize: 13.5, color: safwah.colors.textMute, textAlign: 'center', marginTop: 40 },
});
