// PaymentService - Handles QR payment generation and mock payment processing
// Requirements: 1.1, 1.2, 6.1, 6.3, 1.4

import {
    MerchantInfo,
    PaymentMetadata,
    PaymentMethod,
    PaymentResult,
    PaymentServiceResult,
    QRPaymentData,
    QRPaymentServiceResult,
} from './payment-types';

// Mock payment configuration
const MOCK_PAYMENT_DELAY = 3000; // 3 seconds for development testing
const QR_EXPIRY_MINUTES = 5; // QR codes expire after 5 minutes

class PaymentService {
  private pendingPayments: Map<string, {
    amount: number;
    metadata: PaymentMetadata;
    merchantInfo: MerchantInfo;
    createdAt: Date;
  }> = new Map();

  /**
   * Generate QR payment data with transaction details
   * Requirements: 1.1, 1.2
   * 
   * @param amount - Payment amount
   * @param metadata - Payment metadata including items and order info
   * @param merchantInfo - Merchant business information
   * @returns QR payment data with encoded transaction details
   */
  async generateQRPayment(
    amount: number,
    metadata: PaymentMetadata,
    merchantInfo: MerchantInfo
  ): Promise<QRPaymentServiceResult> {
    try {
      // Generate unique transaction ID
      const transactionId = this.generateTransactionId();
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + QR_EXPIRY_MINUTES);

      // Store pending payment for later confirmation
      this.pendingPayments.set(transactionId, {
        amount,
        metadata,
        merchantInfo,
        createdAt: new Date(),
      });

      // Encode payment data into QR content
      const qrContent = this.encodePaymentData({
        transactionId,
        amount,
        currency: 'USD', // TODO: Get from merchant settings
        merchantName: merchantInfo.businessName,
        merchantId: merchantInfo.taxId || 'MERCHANT_001',
        items: metadata.items,
        timestamp: new Date().toISOString(),
      });

      const qrPaymentData: QRPaymentData = {
        qrContent,
        transactionId,
        amount,
        merchantInfo,
        expiresAt,
      };

      return {
        success: true,
        data: qrPaymentData,
      };
    } catch (error) {
      console.error('Error generating QR payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate QR payment',
      };
    }
  }

  /**
   * Generate unique transaction ID
   * Format: TXN-{timestamp}-{random}
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  /**
   * Encode payment metadata into QR content string
   * Uses JSON encoding for simplicity in development
   */
  private encodePaymentData(data: any): string {
    // In production, this would use a standardized payment protocol
    // For now, we use JSON encoding
    return JSON.stringify(data);
  }

  /**
   * Confirm payment with mock delay (for development)
   * Requirements: 6.1, 6.3
   * 
   * @param transactionId - Transaction ID to confirm
   * @returns Payment result with transaction details
   */
  async confirmPayment(transactionId: string): Promise<PaymentServiceResult> {
    try {
      // Check if payment exists
      const pendingPayment = this.pendingPayments.get(transactionId);
      
      if (!pendingPayment) {
        return {
          success: false,
          error: 'Transaction not found or already processed',
        };
      }

      // Check if payment has expired
      const now = new Date();
      const expiryTime = new Date(pendingPayment.createdAt);
      expiryTime.setMinutes(expiryTime.getMinutes() + QR_EXPIRY_MINUTES);
      
      if (now > expiryTime) {
        this.pendingPayments.delete(transactionId);
        return {
          success: false,
          error: 'Payment has expired',
        };
      }

      // Simulate payment processing delay (mock)
      await new Promise(resolve => setTimeout(resolve, MOCK_PAYMENT_DELAY));

      // Generate realistic payment result
      const paymentResult: PaymentResult = {
        success: true,
        transactionId,
        amount: pendingPayment.amount,
        timestamp: new Date(),
        paymentMethod: PaymentMethod.QR,
      };

      // Clean up pending payment
      this.pendingPayments.delete(transactionId);

      return {
        success: true,
        data: paymentResult,
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm payment',
      };
    }
  }

  /**
   * Cancel pending payment
   * Requirements: 1.4
   * 
   * @param transactionId - Transaction ID to cancel
   */
  async cancelPayment(transactionId: string): Promise<void> {
    this.pendingPayments.delete(transactionId);
  }

  /**
   * Get pending payment details (for testing/debugging)
   */
  getPendingPayment(transactionId: string) {
    return this.pendingPayments.get(transactionId);
  }

  /**
   * Clear all pending payments (for testing)
   */
  clearAllPendingPayments(): void {
    this.pendingPayments.clear();
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
