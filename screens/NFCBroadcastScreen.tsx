// NFCBroadcastScreen - Broadcasts transaction details via NFC
// Allows merchant to share transaction data with customer devices

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '../components/common/Toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useToast } from '../hooks/useToast';

import { nfcService } from '../services/nfc.service';
import {
    MerchantInfo,
    PaymentMetadata
} from '../services/payment-types';
import { theme } from '../theme';

interface NFCBroadcastScreenProps {
  transactionId: string;
  amount: number;
  metadata: PaymentMetadata;
  merchantInfo: MerchantInfo;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type BroadcastStatus = 'initializing' | 'ready' | 'broadcasting' | 'success' | 'error';

export default function NFCBroadcastScreen({
  transactionId,
  amount,
  metadata,
  merchantInfo,
  onSuccess,
  onCancel,
}: NFCBroadcastScreenProps) {
  const router = useRouter();
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast();

  const [status, setStatus] = useState<BroadcastStatus>('initializing');
  const [error, setError] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Animation for NFC icon pulse effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeNFC();

    return () => {
      // Cleanup on unmount
      nfcService.stopBroadcastMode();
    };
  }, []);

  useEffect(() => {
    // Start pulse animation when ready
    if (status === 'ready') {
      startPulseAnimation();
    }
  }, [status]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const initializeNFC = async () => {
    try {
      // Initialize NFC service
      const initResult = await nfcService.initialize();

      if (!initResult.success) {
        setError(initResult.error || 'Failed to initialize NFC');
        setStatus('error');
        showError('NFC initialization failed');
        return;
      }

      // Check NFC availability
      const availabilityResult = await nfcService.isAvailable();

      if (!availabilityResult.success) {
        setError(availabilityResult.error || 'Failed to check NFC availability');
        setStatus('error');
        showError('NFC not available');
        return;
      }

      const availability = availabilityResult.data;

      if (!availability?.isSupported) {
        setError('NFC is not supported on this device');
        setStatus('error');
        showError('NFC not supported');
        return;
      }

      if (!availability?.isEnabled) {
        setError('NFC is disabled. Please enable NFC in device settings');
        setStatus('error');
        showError('NFC is disabled');
        return;
      }

      // NFC is ready
      setStatus('ready');
      showInfo('Ready to broadcast. Tap customer device to share transaction.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('error');
      showError('Failed to initialize NFC');
    }
  };

  const handleBroadcast = async () => {
    try {
      setIsBroadcasting(true);
      setStatus('broadcasting');
      showInfo('Bring customer device near to share transaction...');

      // Prepare transaction data
      const transactionData = {
        transactionId,
        amount,
        merchantInfo,
        timestamp: new Date(),
        items: metadata.items,
      };

      // Broadcast transaction via NFC
      const result = await nfcService.broadcastTransaction(transactionData);

      if (!result.success) {
        setError(result.error || 'Failed to broadcast transaction');
        setStatus('error');
        showError('Broadcast failed');
        setIsBroadcasting(false);
        return;
      }

      // Success
      setStatus('success');
      showSuccess('Transaction shared successfully!');
      setIsBroadcasting(false);

      // Call success callback after delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.back();
        }
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStatus('error');
      showError('Broadcast failed');
      setIsBroadcasting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Broadcast',
      'Are you sure you want to cancel?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            nfcService.stopBroadcastMode();
            if (onCancel) {
              onCancel();
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleRetry = () => {
    setError(null);
    setStatus('initializing');
    initializeNFC();
  };

  // Error state
  if (status === 'error') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={hideToast}
        />
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Broadcast Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <View style={styles.buttonRow}>
            <Button
              title="Try Again"
              onPress={handleRetry}
              variant="primary"
              style={styles.button}
            />
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="secondary"
              style={styles.button}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={hideToast}
        />
        <View style={styles.centerContent}>
          <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
          <Text style={styles.successTitle}>Transaction Shared!</Text>
          <Text style={styles.successAmount}>${amount.toFixed(2)}</Text>
          <Text style={styles.successMessage}>
            Transaction details have been shared with the customer device.
          </Text>
          <Button
            title="Done"
            onPress={() => {
              if (onSuccess) {
                onSuccess();
              } else {
                router.back();
              }
            }}
            variant="primary"
            style={styles.doneButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Main broadcast screen
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Transaction</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Card variant="elevated" style={styles.broadcastCard}>
          {/* NFC Icon with pulse animation */}
          <Animated.View
            style={[
              styles.nfcIconContainer,
              {
                transform: [{ scale: status === 'ready' ? pulseAnim : 1 }],
              },
            ]}
          >
            <View style={[
              styles.nfcIconCircle,
              (status === 'ready' || status === 'broadcasting') && styles.nfcIconCircleActive,
            ]}>
              <Ionicons
                name="wifi"
                size={64}
                color={(status === 'ready' || status === 'broadcasting') ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
          </Animated.View>

          {/* Status indicator */}
          {status === 'broadcasting' && (
            <View style={styles.statusIndicator}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.statusText}>Broadcasting...</Text>
            </View>
          )}

          {/* Amount section */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
          </View>

          {/* Merchant info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{merchantInfo.businessName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="receipt" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>TXN: {transactionId}</Text>
            </View>
          </View>
        </Card>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>How to share:</Text>
          <Text style={styles.instructionsText}>
            1. Tap "Broadcast Transaction" button{'\n'}
            2. Bring customer's NFC-enabled device near{'\n'}
            3. Transaction details will be transferred{'\n'}
            4. Customer can view receipt on their device
          </Text>
        </View>

        {/* Broadcast button */}
        <Button
          title={isBroadcasting ? "Broadcasting..." : "Broadcast Transaction"}
          onPress={handleBroadcast}
          variant="primary"
          disabled={status !== 'ready' || isBroadcasting}
          icon={isBroadcasting ? undefined : "share-outline"}
          style={styles.broadcastButton}
        />

        {/* Cancel button */}
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="secondary"
          style={styles.cancelButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: 28,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  broadcastCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  nfcIconContainer: {
    marginBottom: theme.spacing.lg,
  },
  nfcIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.surface,
    borderWidth: 3,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcIconCircleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusText: {
    fontSize: 16,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    fontWeight: '500',
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  amountLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  infoSection: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  instructionsSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  broadcastButton: {
    marginBottom: theme.spacing.md,
  },
  cancelButton: {
    marginBottom: theme.spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  successAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginBottom: theme.spacing.md,
  },
  successMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  doneButton: {
    minWidth: 200,
  },
});
