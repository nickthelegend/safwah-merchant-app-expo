import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppKit } from '@reown/appkit-react-native';

import { safwah } from '../theme/safwah';
import { useSession } from '../provider/SessionProvider';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'card-outline' as const,
    title: 'Accept crypto,\nsettle in AED',
    body: 'Tourists pay in USDT or ETH — you receive UAE Dirhams the instant they tap. Auto-converted on-chain, zero volatility.',
    accent: safwah.colors.lime,
  },
  {
    icon: 'qr-code-outline' as const,
    title: 'Your phone is\nthe terminal',
    body: 'No hardware, no fees. Show a QR, get paid, and the sale lands in your balance. Print or share a receipt in a tap.',
    accent: safwah.colors.lime,
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Compliant\nby default',
    body: '5% VAT is tracked on every sale and settled straight to your UAE bank. PTSR-ready and reported automatically.',
    accent: safwah.colors.emerald,
  },
];

export default function MerchantOnboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { open } = useAppKit();
  const { enterDemo } = useSession();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: any) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const demo = () => {
    enterDemo();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.root}>
      <View style={styles.glow} pointerEvents="none" />
      <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brand}>safwah</Text>
          <View style={styles.bizChip}>
            <Text style={styles.bizChipText}>merchant</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={styles.pager}
        >
          {SLIDES.map((s, i) => (
            <View key={i} style={[styles.slide, { width }]}>
              <View style={[styles.iconWrap, { borderColor: s.accent }]}>
                <Ionicons name={s.icon} size={54} color={s.accent} />
              </View>
              <Text style={styles.title}>{s.title}</Text>
              <Text style={styles.body}>{s.body}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.connectBtn} activeOpacity={0.9} onPress={() => open()}>
            <Ionicons name="wallet" size={19} color={safwah.colors.onLime} />
            <Text style={styles.connectText}>Connect payout wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.demoBtn} activeOpacity={0.85} onPress={demo}>
            <Text style={styles.demoText}>Explore in demo mode</Text>
          </TouchableOpacity>
          <Text style={styles.legal}>Powered by Reown · WalletConnect · Polygon Amoy</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bg },
  glow: { position: 'absolute', top: -160, alignSelf: 'center', width: 420, height: 420, borderRadius: 210, backgroundColor: safwah.colors.lime, opacity: 0.06 },
  content: { flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, marginBottom: 8 },
  brandDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: safwah.colors.lime },
  brand: { fontFamily: safwah.font.bold, fontSize: 20, color: safwah.colors.text, letterSpacing: 0.5 },
  bizChip: { backgroundColor: safwah.colors.limeWash, paddingVertical: 3, paddingHorizontal: 9, borderRadius: safwah.radius.pill, marginLeft: 2 },
  bizChipText: { fontFamily: safwah.font.semibold, fontSize: 11, color: safwah.colors.lime, letterSpacing: 0.3 },

  pager: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  iconWrap: { width: 116, height: 116, borderRadius: 34, borderWidth: 1.5, backgroundColor: safwah.colors.card, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  title: { fontFamily: safwah.font.bold, fontSize: 30, lineHeight: 36, color: safwah.colors.text, textAlign: 'center', letterSpacing: -0.5 },
  body: { fontFamily: safwah.font.regular, fontSize: 15, lineHeight: 23, color: safwah.colors.textDim, textAlign: 'center', marginTop: 18, maxWidth: 330 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginVertical: 24 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: safwah.colors.borderStrong },
  dotActive: { width: 22, backgroundColor: safwah.colors.lime },

  actions: { paddingHorizontal: 24, gap: 12 },
  connectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, height: 54, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime },
  connectText: { fontFamily: safwah.font.bold, fontSize: 16, color: safwah.colors.onLime },
  demoBtn: { height: 50, borderRadius: safwah.radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border },
  demoText: { fontFamily: safwah.font.semibold, fontSize: 15, color: safwah.colors.text },
  legal: { fontFamily: safwah.font.regular, fontSize: 11.5, color: safwah.colors.textMute, textAlign: 'center', marginTop: 6 },
});
