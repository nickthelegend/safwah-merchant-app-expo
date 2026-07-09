// Basic tests for NFCService
import { nfcService } from '../nfc.service';
import { PaymentMethod } from '../payment-types';

// Mock react-native-nfc-manager
jest.mock('react-native-nfc-manager', () => ({
  __esModule: true,
  default: {
    start: jest.fn().mockResolvedValue(undefined),
    isSupported: jest.fn().mockResolvedValue(true),
    isEnabled: jest.fn().mockResolvedValue(true),
    requestTechnology: jest.fn().mockResolvedValue(undefined),
    cancelTechnologyRequest: jest.fn().mockResolvedValue(undefined),
  },
  NfcTech: {
    Ndef: 'Ndef',
  },
  Ndef: {},
}));

describe('NFCService', () => {
  describe('initialize', () => {
    it('should initialize NFC manager successfully', async () => {
      const result = await nfcService.initialize();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(nfcService.isNFCInitialized()).toBe(true);
    });
  });

  describe('isAvailable', () => {
    it('should return availability when NFC is supported and enabled', async () => {
      const result = await nfcService.isAvailable();

      expect(result.success).toBe(true);
      expect(result.data?.isSupported).toBe(true);
      expect(result.data?.isEnabled).toBe(true);
      expect(result.data?.error).toBeUndefined();
    });
  });

  describe('startScanning', () => {
    it('should start NFC scanning with amount', async () => {
      await nfcService.initialize();
      
      const amount = 100;
      const result = await nfcService.startScanning(amount);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(nfcService.isCurrentlyScanning()).toBe(true);
    });

    it('should restart cleanly if scanning is already in progress', async () => {
      await nfcService.initialize();
      await nfcService.startScanning(100);

      // Re-tapping "scan" while a session is live should stop the old one and
      // start fresh with the new amount — not error out on the merchant.
      const result = await nfcService.startScanning(200);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(nfcService.isCurrentlyScanning()).toBe(true);

      // Clean up
      await nfcService.stopScanning();
    });
  });

  describe('stopScanning', () => {
    it('should stop NFC scanning', async () => {
      await nfcService.initialize();
      await nfcService.startScanning(100);

      expect(nfcService.isCurrentlyScanning()).toBe(true);

      await nfcService.stopScanning();

      expect(nfcService.isCurrentlyScanning()).toBe(false);
    });
  });

  describe('processNFCPayment', () => {
    it('should process NFC payment with mock data', async () => {
      await nfcService.initialize();
      await nfcService.startScanning(150);

      const mockNfcData = {
        id: '04:A1:B2:C3:D4:E5:F6',
        type: 'iso14443a',
      };

      const startTime = Date.now();
      const result = await nfcService.processNFCPayment(mockNfcData);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data?.transactionId).toMatch(/^NFC-\d+-[A-Z0-9]+$/);
      expect(result.data?.amount).toBe(150);
      expect(result.data?.paymentMethod).toBe(PaymentMethod.NFC);
      expect(result.data?.timestamp).toBeInstanceOf(Date);

      // Processing is instant by design (auto-complete on tap) — no artificial delay.
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500);
    });

    it('should fail with invalid NFC data', async () => {
      const result = await nfcService.processNFCPayment(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid NFC data');
    });

    it('should generate realistic transaction data', async () => {
      // Stop any previous scanning and start fresh
      await nfcService.stopScanning();
      await nfcService.initialize();
      await nfcService.startScanning(250);

      const mockNfcData = {
        id: '04:11:22:33:44:55:66',
        type: 'mifare',
      };

      const result = await nfcService.processNFCPayment(mockNfcData);

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
      expect(result.data?.transactionId).toBeDefined();
      expect(result.data?.timestamp).toBeInstanceOf(Date);
      expect(result.data?.amount).toBe(250);
      expect(result.data?.paymentMethod).toBe(PaymentMethod.NFC);
    });
  });
});
