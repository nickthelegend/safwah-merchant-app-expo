// QRPaymentScreen - Display QR code for customer payment scanning
// Requirements: 1.1, 1.2, 1.4, 1.3, 6.1, 7.1, 7.2, 7.5

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
import { PrinterErrorDisplay } from '../components/common/PrinterErrorDisplay';
import { Toast } from '../components/common/Toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useToast } from '../hooks/useToast';
import {
    MerchantInfo,
    PaymentMetadata,
    PaymentMethod,
    PaymentProcessingStatus,
    QRPaymentData,
    Transaction,
    TransactionStatus,
} from '../services/payment-types';
import { paymentService } from '../services/payment.service';
import { printerService } from '../services/printer.service';
import { usePaymentStore } from '../stores/paymentStore';
import { theme } from '../theme';

interface QRPaymentScreenProps {
  amount: number;
  metadata: PaymentMetadata;
  merchantInfo: MerchantInfo;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
}

export default function QRPaymentScreen({
  amount,
  metadata,
  merchantInfo,
  onSuccess,
  onCancel,
}: QRPaymentScreenProps) {
  const router = useRouter();
  const [qrData, setQrData] = useState<QRPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes in seconds
  const [printerError, setPrinterError] = useState<{ message: string; type: any } | null>(null);
  
  const { paymentStatus, setPaymentStatus, setTransaction } = usePaymentStore();
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const paymentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
    return () => {
      // Cleanup timers on unmount
      if (paymentTimeoutRef.current) {
        clearTimeout(paymentTimeoutRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Start countdown timer
  useEffect(() => {
    if (qrData && paymentStatus === PaymentProcessingStatus.PROCESSING) {
      countdownRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [qrData, paymentStatus]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      setPaymentStatus(PaymentProcessingStatus.PROCESSING);

      const result = await paymentService.generateQRPayment(
        amount,
        metadata,
        merchantInfo
      );

      if (result.success && result.data) {
        setQrData(result.data);
        
        // Start mock payment confirmation (Requirement 6.1)
        startMockPaymentConfirmation(result.data.transactionId);
      } else {
        setError(result.error || 'Failed to generate QR code');
        setPaymentStatus(PaymentProcessingStatus.FAILED);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setPaymentStatus(PaymentProcessingStatus.FAILED);
      console.error('QR generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startMockPaymentConfirmation = async (transactionId: string) => {
    // Mock payment confirmation after delay (Requirement 6.1, 7.2)
    paymentTimeoutRef.current = setTimeout(async () => {
      const result = await paymentService.confirmPayment(transactionId);
      
      if (result.success && result.data) {
        handlePaymentSuccess(result.data.transactionId);
      } else {
        setError(result.error || 'Payment confirmation failed');
        setPaymentStatus(PaymentProcessingStatus.FAILED);
      }
    }, 3000); // 3 second delay for mock confirmation
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    setPaymentStatus(PaymentProcessingStatus.SUCCESS);
    showSuccess('Payment completed successfully!');

    // Create transaction object for receipt printing
    const transaction: Transaction = {
      id: transactionId,
      amount,
      currency: 'USD',
      paymentMethod: PaymentMethod.QR,
      status: TransactionStatus.COMPLETED,
      timestamp: new Date(),
      items: metadata.items,
      merchantInfo,
      receiptNumber: `RCP-${Date.now()}`,
    };

    setTransaction(transaction);

    // Don't auto-print or auto-redirect
    // User will manually click "Print Bill" button if they want to print
    // User will click "Done" when ready to leave
  };

  const handlePrintReceipt = async () => {
    if (!qrData) return;
    
    const transaction: Transaction = {
      id: qrData.transactionId,
      amount,
      currency: 'USD',
      paymentMethod: PaymentMethod.QR,
      status: TransactionStatus.COMPLETED,
      timestamp: new Date(),
      items: metadata.items,
      merchantInfo,
      receiptNumber: `RCP-${Date.now()}`,
    };

    const printResult = await printerService.printReceiptDirect(transaction);
    
    if (printResult.success) {
      setPrinterError(null);
      showSuccess('Receipt printed successfully!');
    } else {
      setPrinterError({
        message: printResult.error || 'Failed to print receipt',
        type: printResult.errorType || 'unknown',
      });
      showError('Print failed');
    }
  };

  const handleRetryPrint = async () => {
    if (!qrData) return;
    
    const transaction: Transaction = {
      id: qrData.transactionId,
      amount,
      currency: 'USD',
      paymentMethod: PaymentMethod.QR,
      status: TransactionStatus.COMPLETED,
      timestamp: new Date(),
      items: metadata.items,
      merchantInfo,
      receiptNumber: `RCP-${Date.now()}`,
    };

    const printResult = await printerService.printReceiptDirect(transaction);
    
    if (printResult.success) {
      setPrinterError(null);
      showSuccess('Receipt printed successfully!');
    } else {
      showError('Print failed. Please try again.');
    }
  };

  const handleTimeout = () => {
    // Auto-cancel after timeout (Requirement 7.5)
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    if (paymentTimeoutRef.current) {
      clearTimeout(paymentTimeoutRef.current);
    }

    if (qrData) {
      paymentService.cancelPayment(qrData.transactionId);
    }

    setPaymentStatus(PaymentProcessingStatus.FAILED);
    setError('Payment timed out');
    
    Alert.alert(
      'Payment Timeout',
      'The payment request has expired. Please try again.',
      [{ text: 'OK', onPress: handleCancel }]
    );
  };

  const handleCancel = () => {
    // Cancel payment (Requirement 1.4)
    if (paymentTimeoutRef.current) {
      clearTimeout(paymentTimeoutRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    // If payment was successful, call onSuccess callback
    if (paymentStatus === PaymentProcessingStatus.SUCCESS && qrData) {
      if (onSuccess) {
        onSuccess(qrData.transactionId);
      } else {
        router.back();
      }
      return;
    }

    // Otherwise it's a cancellation
    if (qrData) {
      paymentService.cancelPayment(qrData.transactionId);
    }

    setPaymentStatus(PaymentProcessingStatus.IDLE);
    
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Generating QR Code...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && paymentStatus === PaymentProcessingStatus.FAILED) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Payment Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <View style={styles.buttonRow}>
            <Button
              title="Try Again"
              onPress={generateQRCode}
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
  if (paymentStatus === PaymentProcessingStatus.SUCCESS) {
    return (
      <SafeAreaView style={styles.container}>
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={hideToast}
        />
        <View style={styles.centerContent}>
          <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successAmount}>${amount.toFixed(2)}</Text>
          <Text style={styles.successMessage}>
            Transaction ID: {qrData?.transactionId}
          </Text>
          
          {/* Show printer error if printing failed (Requirement 3.4) */}
          {printerError && (
            <View style={styles.printerErrorContainer}>
              <PrinterErrorDisplay
                errorType={printerError.type}
                errorMessage={printerError.message}
                onRetry={handleRetryPrint}
                onDismiss={() => setPrinterError(null)}
                compact
              />
            </View>
          )}
          
          <Button
            title="Print Bill"
            onPress={handlePrintReceipt}
            variant="primary"
            style={styles.printButton}
          />
          
          <Button
            title="Done"
            onPress={handleCancel}
            variant="gradient"
            style={styles.doneButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Main QR display state (Requirement 1.1, 1.2)
  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Scan to Pay</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Card variant="elevated" style={styles.qrCard}>
          {/* QR Code Display */}
          <View style={styles.qrCodeContainer}>
            {qrData && (
              <QRCodeStyled
                data={qrData.qrContent}
                style={styles.qrCode}
                padding={20}
                color={theme.colors.text}
              />
            )}
          </View>

          {/* Amount Display (Requirement 1.2) */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
          </View>

          {/* Merchant Info (Requirement 1.2) */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{merchantInfo.businessName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{merchantInfo.address}</Text>
            </View>
          </View>

          {/* Transaction ID (Requirement 1.2) */}
          <View style={styles.transactionSection}>
            <Text style={styles.transactionLabel}>Transaction ID</Text>
            <Text style={styles.transactionId}>{qrData?.transactionId}</Text>
          </View>

          {/* Timer */}
          <View style={styles.timerSection}>
            <Ionicons name="time" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.timerText}>
              Expires in {formatTime(timeRemaining)}
            </Text>
          </View>
        </Card>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>How to pay:</Text>
          <Text style={styles.instructionsText}>
            1. Open your payment app{'\n'}
            2. Scan this QR code{'\n'}
            3. Confirm the payment
          </Text>
        </View>

        {/* Cancel Button (Requirement 1.4) */}
        <Button
          title="Cancel Payment"
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h2,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body,
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
  },
  qrCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  qrCodeContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  qrCode: {
    width: 250,
    height: 250,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },
  amountLabel: {
    ...theme.typography.bodySmall,
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
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  transactionSection: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  transactionLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  transactionId: {
    ...theme.typography.body,
    fontFamily: 'monospace',
    color: theme.colors.text,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },
  timerText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  instructionsSection: {
    marginBottom: theme.spacing.lg,
  },
  instructionsTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  instructionsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  cancelButton: {
    marginTop: 'auto',
  },
  errorTitle: {
    ...theme.typography.h2,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  errorMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
  successTitle: {
    ...theme.typography.h1,
    color: theme.colors.success,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  successAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  successMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  printButton: {
    minWidth: 200,
    marginBottom: theme.spacing.md,
  },
  doneButton: {
    minWidth: 200,
  },
  printerErrorContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
});
