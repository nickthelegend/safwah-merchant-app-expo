// Basic tests for PaymentService
import { PaymentMethod } from '../payment-types';
import { paymentService } from '../payment.service';

describe('PaymentService', () => {
  beforeEach(() => {
    // Clear any pending payments before each test
    paymentService.clearAllPendingPayments();
  });

  describe('generateQRPayment', () => {
    it('should generate QR payment with transaction ID', async () => {
      const amount = 100;
      const metadata = {
        items: [
          {
            id: '1',
            name: 'Test Item',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
      };
      const merchantInfo = {
        businessName: 'Test Business',
        address: '123 Test St',
        phone: '555-0100',
      };

      const result = await paymentService.generateQRPayment(
        amount,
        metadata,
        merchantInfo
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.transactionId).toMatch(/^TXN-\d+-[A-Z0-9]+$/);
      expect(result.data?.amount).toBe(amount);
      expect(result.data?.qrContent).toBeDefined();
      expect(result.data?.merchantInfo).toEqual(merchantInfo);
      expect(result.data?.expiresAt).toBeInstanceOf(Date);
    });

    it('should encode payment data in QR content', async () => {
      const amount = 50;
      const metadata = {
        items: [
          {
            id: '1',
            name: 'Item',
            quantity: 2,
            unitPrice: 25,
            totalPrice: 50,
          },
        ],
      };
      const merchantInfo = {
        businessName: 'Shop',
        address: '456 Main St',
        phone: '555-0200',
      };

      const result = await paymentService.generateQRPayment(
        amount,
        metadata,
        merchantInfo
      );

      expect(result.success).toBe(true);
      const qrData = JSON.parse(result.data!.qrContent);
      expect(qrData.transactionId).toBe(result.data!.transactionId);
      expect(qrData.amount).toBe(amount);
      expect(qrData.merchantName).toBe(merchantInfo.businessName);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment after delay', async () => {
      const amount = 100;
      const metadata = {
        items: [
          {
            id: '1',
            name: 'Test Item',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
      };
      const merchantInfo = {
        businessName: 'Test Business',
        address: '123 Test St',
        phone: '555-0100',
      };

      const qrResult = await paymentService.generateQRPayment(
        amount,
        metadata,
        merchantInfo
      );

      expect(qrResult.success).toBe(true);
      const transactionId = qrResult.data!.transactionId;

      const startTime = Date.now();
      const confirmResult = await paymentService.confirmPayment(transactionId);
      const endTime = Date.now();

      expect(confirmResult.success).toBe(true);
      expect(confirmResult.data?.transactionId).toBe(transactionId);
      expect(confirmResult.data?.amount).toBe(amount);
      expect(confirmResult.data?.paymentMethod).toBe(PaymentMethod.QR);
      expect(confirmResult.data?.timestamp).toBeInstanceOf(Date);
      
      // Verify delay was applied (should be ~3000ms)
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThanOrEqual(2900); // Allow small variance
    });

    it('should fail for non-existent transaction', async () => {
      const result = await paymentService.confirmPayment('INVALID-TXN');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should generate realistic transaction data', async () => {
      const amount = 250;
      const metadata = {
        items: [
          {
            id: '1',
            name: 'Product A',
            quantity: 2,
            unitPrice: 125,
            totalPrice: 250,
          },
        ],
      };
      const merchantInfo = {
        businessName: 'Store',
        address: '789 Oak Ave',
        phone: '555-0300',
      };

      const qrResult = await paymentService.generateQRPayment(
        amount,
        metadata,
        merchantInfo
      );

      const confirmResult = await paymentService.confirmPayment(
        qrResult.data!.transactionId
      );

      expect(confirmResult.success).toBe(true);
      expect(confirmResult.data?.success).toBe(true);
      expect(confirmResult.data?.transactionId).toBeDefined();
      expect(confirmResult.data?.timestamp).toBeInstanceOf(Date);
      expect(confirmResult.data?.amount).toBe(amount);
    });
  });

  describe('cancelPayment', () => {
    it('should cancel pending payment', async () => {
      const amount = 100;
      const metadata = {
        items: [
          {
            id: '1',
            name: 'Test Item',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
      };
      const merchantInfo = {
        businessName: 'Test Business',
        address: '123 Test St',
        phone: '555-0100',
      };

      const qrResult = await paymentService.generateQRPayment(
        amount,
        metadata,
        merchantInfo
      );

      const transactionId = qrResult.data!.transactionId;

      // Verify payment exists
      expect(paymentService.getPendingPayment(transactionId)).toBeDefined();

      // Cancel payment
      await paymentService.cancelPayment(transactionId);

      // Verify payment is removed
      expect(paymentService.getPendingPayment(transactionId)).toBeUndefined();

      // Confirm should fail now
      const confirmResult = await paymentService.confirmPayment(transactionId);
      expect(confirmResult.success).toBe(false);
    });
  });
});
