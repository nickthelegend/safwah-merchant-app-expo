import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount } from 'wagmi';

import { safwah } from '../theme/safwah';
import { fmt, shortAddr } from '../lib/fmt';
import { isToday, useSettlement, vatOf, weeklyRevenue } from '../stores/settlementStore';
import { ChartContainer } from '../components/charts/ChartContainer';
import { LineChart } from '../components/charts/LineChart';

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { business, available, sales } = useSettlement();

  const today = sales.filter((s) => isToday(s.ts));
  const todayRevenue = today.reduce((s, t) => s + t.amountAED, 0);
  const todayVat = today.reduce((s, t) => s + vatOf(t.amountAED), 0);
  const week = weeklyRevenue(sales);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 130 }}
      >
        <View style={styles.topbar}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brand}>safwah</Text>
            <View style={styles.bizChip}>
              <Text style={styles.bizChipText}>merchant</Text>
            </View>
          </View>
          <View style={styles.walletPill}>
            <View style={[styles.dot, { backgroundColor: isConnected ? safwah.colors.emerald : safwah.colors.textMute }]} />
            <Text style={styles.walletText}>{isConnected ? shortAddr(address) : 'Settlement'}</Text>
          </View>
        </View>

        <Text style={styles.greeting}>{greet},</Text>
        <Text style={styles.bizName}>{business.name}</Text>

        {/* Settlement balance */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Available to settle</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountCcy}>AED</Text>
            <Text style={styles.amount}>{fmt(available)}</Text>
          </View>
          <Text style={styles.amountSub}>Auto-converted from USDT · ETH at point of sale · 0 pending</Text>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.85} onPress={() => router.push('/bridge')}>
              <Ionicons name="arrow-up-circle-outline" size={17} color={safwah.colors.text} />
              <Text style={styles.ghostBtnText}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.limeBtn} activeOpacity={0.9} onPress={() => router.push('/pos')}>
              <Ionicons name="card" size={17} color={safwah.colors.onLime} />
              <Text style={styles.limeBtnText}>New charge</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today stats */}
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <View style={styles.statTop}>
              <Ionicons name="trending-up" size={16} color={safwah.colors.emerald} />
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <Text style={styles.statValue}>{fmt(todayRevenue, 0)}</Text>
            <Text style={styles.statUnit}>AED today</Text>
          </View>
          <View style={styles.stat}>
            <View style={styles.statTop}>
              <Ionicons name="receipt-outline" size={16} color={safwah.colors.lime} />
              <Text style={styles.statLabel}>Sales</Text>
            </View>
            <Text style={styles.statValue}>{today.length}</Text>
            <Text style={styles.statUnit}>today</Text>
          </View>
          <View style={styles.stat}>
            <View style={styles.statTop}>
              <Ionicons name="shield-checkmark-outline" size={16} color={safwah.colors.emerald} />
              <Text style={styles.statLabel}>VAT</Text>
            </View>
            <Text style={styles.statValue}>{fmt(todayVat, 0)}</Text>
            <Text style={styles.statUnit}>collected</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.grid}>
          <QuickAction icon="qr-code" label="Charge" hint="QR / amount" onPress={() => router.push('/pos')} />
          <QuickAction icon="swap-horizontal" label="Settle" hint="To bank" onPress={() => router.push('/bridge')} />
          <QuickAction icon="receipt" label="Sales" hint="History" onPress={() => router.push('/transactions')} />
          <QuickAction icon="storefront-outline" label="Store" hint="Profile" onPress={() => router.push('/profile')} />
        </View>

        {/* Revenue chart → full analytics */}
        <ChartContainer
          title="Revenue"
          description="Last 7 days · AED settled"
          style={{ marginTop: 26 }}
          right={
            <TouchableOpacity style={styles.analyticsBtn} activeOpacity={0.85} onPress={() => router.push('/analytics')}>
              <Ionicons name="stats-chart" size={14} color={safwah.colors.lime} />
              <Text style={styles.analyticsText}>Analytics</Text>
            </TouchableOpacity>
          }
        >
          <LineChart data={week} config={{ height: 180, showGrid: true, showLabels: true }} />
        </ChartContainer>
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, hint, onPress }: { icon: string; label: string; hint: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.action} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon as never} size={20} color={safwah.colors.lime} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionHint}>{hint}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bg },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: safwah.colors.lime },
  brand: { fontFamily: safwah.font.bold, fontSize: 19, color: safwah.colors.text, letterSpacing: 0.4 },
  bizChip: { backgroundColor: safwah.colors.limeWash, paddingVertical: 3, paddingHorizontal: 8, borderRadius: safwah.radius.pill, marginLeft: 3 },
  bizChipText: { fontFamily: safwah.font.semibold, fontSize: 10.5, color: safwah.colors.lime, letterSpacing: 0.3 },
  walletPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, paddingVertical: 7, paddingHorizontal: 11, borderRadius: safwah.radius.pill },
  dot: { width: 6, height: 6, borderRadius: 3 },
  walletText: { fontFamily: safwah.font.mono, fontSize: 11.5, color: safwah.colors.textDim },
  greeting: { fontFamily: safwah.font.regular, fontSize: 14, color: safwah.colors.textDim, marginTop: 18 },
  bizName: { fontFamily: safwah.font.bold, fontSize: 23, color: safwah.colors.text, letterSpacing: -0.4, marginTop: 2 },

  hero: { marginTop: 16, paddingVertical: 20, paddingHorizontal: 18, borderRadius: safwah.radius.lg, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: safwah.colors.emeraldWash, paddingVertical: 4, paddingHorizontal: 9, borderRadius: safwah.radius.pill },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: safwah.colors.emerald },
  liveText: { fontFamily: safwah.font.semibold, fontSize: 10.5, color: safwah.colors.emerald },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 16 },
  amountCcy: { fontFamily: safwah.font.semibold, fontSize: 17, color: safwah.colors.textDim, marginBottom: 8 },
  amount: { fontFamily: safwah.font.monoBold, fontSize: 42, color: safwah.colors.text, letterSpacing: -1 },
  amountSub: { fontFamily: safwah.font.regular, fontSize: 12, color: safwah.colors.textMute, marginTop: 8 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  ghostBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 46, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.borderStrong },
  ghostBtnText: { fontFamily: safwah.font.semibold, fontSize: 14.5, color: safwah.colors.text },
  limeBtn: { flex: 1.3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 46, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime },
  limeBtnText: { fontFamily: safwah.font.bold, fontSize: 14.5, color: safwah.colors.onLime },

  statRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  stat: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  statLabel: { fontFamily: safwah.font.regular, fontSize: 11.5, color: safwah.colors.textDim },
  statValue: { fontFamily: safwah.font.monoBold, fontSize: 19, color: safwah.colors.text },
  statUnit: { fontFamily: safwah.font.regular, fontSize: 10.5, color: safwah.colors.textMute, marginTop: 2 },

  grid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  action: { flex: 1, paddingVertical: 14, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, alignItems: 'center' },
  actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: safwah.colors.limeWash, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  actionLabel: { fontFamily: safwah.font.semibold, fontSize: 12.5, color: safwah.colors.text },
  actionHint: { fontFamily: safwah.font.regular, fontSize: 10, color: safwah.colors.textMute, marginTop: 1 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 6 },
  sectionTitle: { fontFamily: safwah.font.semibold, fontSize: 16, color: safwah.colors.text },
  seeAll: { fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.lime },
  analyticsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: safwah.colors.limeWash, paddingVertical: 6, paddingHorizontal: 11, borderRadius: safwah.radius.pill },
  analyticsText: { fontFamily: safwah.font.semibold, fontSize: 12, color: safwah.colors.lime },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: safwah.colors.hairline },
  txIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: safwah.colors.card, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  txName: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.text },
  txMeta: { fontFamily: safwah.font.mono, fontSize: 11, color: safwah.colors.textMute, marginTop: 2 },
  txAmt: { fontFamily: safwah.font.monoBold, fontSize: 14, color: safwah.colors.emerald },
  txVat: { fontFamily: safwah.font.mono, fontSize: 10.5, color: safwah.colors.textMute, marginTop: 3 },
});
