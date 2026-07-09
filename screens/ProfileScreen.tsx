import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit-react-native';

import { safwah } from '../theme/safwah';
import { fmt, shortAddr } from '../lib/fmt';
import { useSettlement } from '../stores/settlementStore';
import { useMerchantOnchain } from '../hooks/useMerchantOnchain';
import { useSession } from '../provider/SessionProvider';
import { AlertDialog, useAlertDialog } from '../components/safwah/AlertDialog';
import { BottomSheet, useBottomSheet } from '../components/safwah/BottomSheet';
import { useToast } from '../components/safwah/Toast';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { business, available, sales } = useSettlement();
  const { address, isConnected, chain } = useAccount();
  const { active: onchainActive } = useMerchantOnchain();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { exitDemo } = useSession();

  const [autoSettle, setAutoSettle] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();
  const signOutDialog = useAlertDialog();
  const ccySheet = useBottomSheet();

  const lifetime = sales.reduce((s, t) => s + t.amountAED, 0);

  const doSignOut = () => {
    signOutDialog.close();
    exitDemo();
    disconnect();
    router.replace('/onboarding');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 130 }}
      >
        <Text style={styles.title}>Store</Text>

        <TouchableOpacity style={styles.identity} activeOpacity={0.8} onPress={() => router.push('/store-edit')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{business.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bizName}>{business.name}</Text>
            <Text style={styles.bizMeta}>{business.category}</Text>
            <Text style={styles.bizMeta}>{business.emirate}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 10 }}>
            {isConnected && !onchainActive ? (
              <View style={[styles.verifyBadge, { backgroundColor: safwah.colors.limeWash }]}>
                <Ionicons name="add-circle" size={12} color={safwah.colors.lime} />
                <Text style={[styles.verifyText, { color: safwah.colors.lime }]}>Register</Text>
              </View>
            ) : (
              <View style={styles.verifyBadge}>
                <Ionicons name="shield-checkmark" size={12} color={safwah.colors.emerald} />
                <Text style={styles.verifyText}>{isConnected && onchainActive ? 'Active' : 'PTSR'}</Text>
              </View>
            )}
            <Ionicons name="create-outline" size={17} color={safwah.colors.textMute} />
          </View>
        </TouchableOpacity>

        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statV}>AED {fmt(available, 0)}</Text>
            <Text style={styles.statL}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statV}>AED {fmt(lifetime, 0)}</Text>
            <Text style={styles.statL}>Lifetime</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statV}>{sales.length}</Text>
            <Text style={styles.statL}>Sales</Text>
          </View>
        </View>

        {/* Wallet */}
        <Text style={styles.sectionLabel}>Settlement wallet</Text>
        <View style={styles.wallet}>
          {isConnected ? (
            <>
              <View style={styles.walletTop}>
                <View style={styles.netPill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.netText}>{chain?.name || 'Polygon Amoy'}</Text>
                </View>
                <Text style={styles.reown}>Reown</Text>
              </View>
              <Text style={styles.address}>{address}</Text>
              <View style={styles.walletActions}>
                <TouchableOpacity style={styles.manageBtn} activeOpacity={0.85} onPress={() => open()}>
                  <Text style={styles.manageText}>Manage</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.disconnectBtn} activeOpacity={0.85} onPress={() => disconnect()}>
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.walletIconWrap}>
                <Ionicons name="wallet-outline" size={24} color={safwah.colors.lime} />
              </View>
              <Text style={styles.walletTitle}>Connect your payout wallet</Text>
              <Text style={styles.walletSub}>Link an EVM wallet to receive on-chain AED settlement. Powered by Reown · WalletConnect.</Text>
              <TouchableOpacity style={styles.connectBtn} activeOpacity={0.9} onPress={() => open()}>
                <Ionicons name="wallet" size={18} color={safwah.colors.onLime} />
                <Text style={styles.connectText}>Connect Wallet</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Settlement settings */}
        <Text style={styles.sectionLabel}>Settlement</Text>
        <View style={styles.card}>
          <Row icon="cash-outline" label="Settlement currency" value="AED" onPress={ccySheet.open} />
          <ToggleRow icon="flash-outline" label="Instant auto-settle" value={autoSettle} onValueChange={setAutoSettle} />
          <Row
            icon="business-outline"
            label="Payout bank"
            value="ENBD"
            onPress={() => Alert.alert('Payout bank', `Emirates NBD · Business\n${business.iban}`)}
          />
          <Row
            icon="document-text-outline"
            label="VAT / TRN"
            value="Registered"
            onPress={() => Alert.alert('VAT registration', 'TRN 100••••••••003 · 5% UAE VAT is tracked on every sale and reported automatically.')}
            last
          />
        </View>

        {/* Terminal hardware — keeps the ported POS modules reachable */}
        <Text style={styles.sectionLabel}>Terminal</Text>
        <View style={styles.card}>
          <Row icon="print-outline" label="Receipt printer" value="Test" onPress={() => router.push('/printer-test')} />
          <Row icon="wifi-outline" label="NFC reader" value="Setup" onPress={() => router.push('/nfc-scanner')} />
          <ToggleRow icon="notifications-outline" label="Payment alerts" value={notifications} onValueChange={setNotifications} last />
        </View>

        <TouchableOpacity style={styles.signOut} activeOpacity={0.8} onPress={signOutDialog.open}>
          <Ionicons name="log-out-outline" size={18} color={safwah.colors.danger} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      <AlertDialog
        isVisible={signOutDialog.isVisible}
        onClose={signOutDialog.close}
        title="Sign out"
        description="You'll need to reconnect your payout wallet to accept payments again."
        confirmText="Sign out"
        destructive
        onConfirm={doSignOut}
        onCancel={signOutDialog.close}
      />

      <BottomSheet isVisible={ccySheet.isVisible} onClose={ccySheet.close} title="Settlement currency">
        <Text style={styles.sheetHint}>Crypto payments auto-convert via SafwahSwap. Choose what lands in your balance.</Text>
        <CcyOption code="AED" name="UAE Dirham" selected onPress={() => { toast({ title: 'Settlement currency', description: 'Set to AED', variant: 'success' }); ccySheet.close(); }} />
        <CcyOption code="USD" name="US Dollar · soon" disabled />
        <CcyOption code="USDT" name="Tether · soon" disabled />
      </BottomSheet>
    </View>
  );
}

function CcyOption({ code, name, selected, disabled, onPress }: { code: string; name: string; selected?: boolean; disabled?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity style={[styles.ccyOption, disabled && { opacity: 0.4 }]} activeOpacity={disabled ? 1 : 0.8} onPress={disabled ? undefined : onPress} disabled={disabled}>
      <View style={styles.ccyBadge}>
        <Text style={styles.ccyBadgeText}>{code}</Text>
      </View>
      <Text style={styles.ccyName}>{name}</Text>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={safwah.colors.lime} /> : <View style={styles.ccyRadio} />}
    </TouchableOpacity>
  );
}

function Row({ icon, label, value, onPress, last }: { icon: string; label: string; value?: string; onPress?: () => void; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.settingRow, !last && styles.settingBorder]} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as never} size={17} color={safwah.colors.textDim} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {value ? <Text style={styles.settingValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={safwah.colors.textMute} />
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, label, value, onValueChange, last }: { icon: string; label: string; value: boolean; onValueChange: (b: boolean) => void; last?: boolean }) {
  return (
    <View style={[styles.settingRow, !last && styles.settingBorder]}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as never} size={17} color={safwah.colors.textDim} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: safwah.colors.lime, false: 'rgba(255,255,255,0.12)' }}
        thumbColor={safwah.colors.text}
        ios_backgroundColor="rgba(255,255,255,0.12)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: safwah.colors.bg },
  title: { fontFamily: safwah.font.bold, fontSize: 27, color: safwah.colors.text, letterSpacing: -0.5, marginBottom: 16 },

  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, padding: 16 },
  avatar: { width: 54, height: 54, borderRadius: 16, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: safwah.font.bold, fontSize: 25, color: safwah.colors.onLime },
  bizName: { fontFamily: safwah.font.bold, fontSize: 18, color: safwah.colors.text },
  bizMeta: { fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textDim, marginTop: 2 },
  verifyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: safwah.colors.emeraldWash, paddingVertical: 5, paddingHorizontal: 10, borderRadius: safwah.radius.pill },
  verifyText: { fontFamily: safwah.font.semibold, fontSize: 11, color: safwah.colors.emerald },

  statRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, paddingVertical: 16, marginTop: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statV: { fontFamily: safwah.font.monoBold, fontSize: 16, color: safwah.colors.text },
  statL: { fontFamily: safwah.font.regular, fontSize: 11, color: safwah.colors.textMute, marginTop: 3 },
  statDivider: { width: 1, height: 30, backgroundColor: safwah.colors.hairline },

  sectionLabel: { fontFamily: safwah.font.semibold, fontSize: 13, color: safwah.colors.textMute, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 26, marginBottom: 10 },

  wallet: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, padding: 18, alignItems: 'center' },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  netPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: safwah.colors.emeraldWash, paddingVertical: 5, paddingHorizontal: 10, borderRadius: safwah.radius.pill },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: safwah.colors.emerald },
  netText: { fontFamily: safwah.font.semibold, fontSize: 11.5, color: safwah.colors.emerald },
  reown: { fontFamily: safwah.font.medium, fontSize: 12, color: safwah.colors.textMute },
  address: { fontFamily: safwah.font.mono, fontSize: 12.5, color: safwah.colors.textDim, marginTop: 14, width: '100%' },
  walletActions: { flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' },
  manageBtn: { flex: 1, height: 44, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  manageText: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.text },
  disconnectBtn: { flex: 1, height: 44, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.cardSoft, borderWidth: 1, borderColor: safwah.colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  disconnectText: { fontFamily: safwah.font.semibold, fontSize: 14, color: safwah.colors.danger },
  walletIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: safwah.colors.limeWash, alignItems: 'center', justifyContent: 'center', marginBottom: 14, marginTop: 4 },
  walletTitle: { fontFamily: safwah.font.semibold, fontSize: 16, color: safwah.colors.text },
  walletSub: { fontFamily: safwah.font.regular, fontSize: 12.5, color: safwah.colors.textDim, textAlign: 'center', marginTop: 8, lineHeight: 18, paddingHorizontal: 6 },
  connectBtn: { flexDirection: 'row', gap: 9, height: 50, paddingHorizontal: 40, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.lime, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  connectText: { fontFamily: safwah.font.bold, fontSize: 15, color: safwah.colors.onLime },

  card: { backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, borderRadius: safwah.radius.lg, paddingHorizontal: 6, paddingVertical: 2 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, paddingHorizontal: 10 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: safwah.colors.hairline },
  settingIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: safwah.colors.cardSoft, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontFamily: safwah.font.medium, fontSize: 14.5, color: safwah.colors.text },
  settingValue: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textDim, marginRight: 4 },

  signOut: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, marginTop: 24 },
  signOutText: { fontFamily: safwah.font.semibold, fontSize: 14.5, color: safwah.colors.danger },

  sheetHint: { fontFamily: safwah.font.regular, fontSize: 13, color: safwah.colors.textDim, marginBottom: 14, lineHeight: 19 },
  ccyOption: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 14, borderRadius: safwah.radius.md, backgroundColor: safwah.colors.card, borderWidth: 1, borderColor: safwah.colors.border, marginBottom: 10 },
  ccyBadge: { width: 46, height: 36, borderRadius: 10, backgroundColor: safwah.colors.cardSoft, alignItems: 'center', justifyContent: 'center' },
  ccyBadgeText: { fontFamily: safwah.font.bold, fontSize: 12.5, color: safwah.colors.text },
  ccyName: { flex: 1, fontFamily: safwah.font.medium, fontSize: 14.5, color: safwah.colors.text },
  ccyRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: safwah.colors.borderStrong },
});
