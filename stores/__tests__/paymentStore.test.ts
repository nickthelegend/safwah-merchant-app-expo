import type { PrinterStatus, Transaction } from '../../services/payment-types';
import { PaymentMethod, PaymentProcessingStatus, TransactionStatus } from '../../services/payment-types';
import { selectCurrentTransaction, selectIsPaymentProcessing, selectIsPrinterAvailable, selectPaymentStatus, selectPrinterStatus, usePaymentStore } from '../paymentStore';

describe('PaymentStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePaymentStore.setState({
      currentTransaction: null,
      paymentStatus: PaymentProcessingStatus.IDLE,
      printerStatus: {
        isAvailable: false,
        isConnected: false,
      },
    });
  });

  describe('Initial State', () => {
    it('should have null currentTransaction initially', () => {
      const state = usePaymentStore.getState();
      expect(state.currentTransaction).toBeNull();
    });

    it('should have IDLE paymentStatus initially', () => {
      const state = usePaymentStore.getState();
      expect(state.paymentStatus).toBe(PaymentProcessingStatus.IDLE);
    });

    it('should have unavailable printer status initially', () => {
      const state = usePaymentStore.getState();
      expect(state.printerStatus.isAvailable).toBe(false);
      expect(state.printerStatus.isConnected).toBe(false);
    });
  });

  describe('setTransaction', () => {
    it('should update currentTransaction', () => {
      const mockTransaction: Transaction = {
        id: 'txn-123',
        amount: 100,
        currency: 'USD',
        paymentMethod: PaymentMethod.QR,
        status: TransactionStatus.PENDING,
        timestamp: new Date(),
        items: [],
        merchantInfo: {
          businessName: 'Test Store',
          address: '123 Main St',
          phone: '555-0100',
        },
        receiptNumber: 'RCP-001',
      };

      usePaymentStore.getState().setTransaction(mockTransaction);
      
      const state = usePaymentStore.getState();
      expect(state.currentTransaction).toEqual(mockTransaction);
    });

    it('should allow setting transaction to null', () => {
      const mockTransaction: Transaction = {
        id: 'txn-123',
        amount: 100,
        currency: 'USD',
        paymentMethod: PaymentMethod.QR,
        status: TransactionStatus.PENDING,
        timestamp: new Date(),
        items: [],
        merchantInfo: {
          businessName: 'Test Store',
          address: '123 Main St',
          phone: '555-0100',
        },
        receiptNumber: 'RCP-001',
      };

      usePaymentStore.getState().setTransaction(mockTransaction);
      usePaymentStore.getState().setTransaction(null);
      
      const state = usePaymentStore.getState();
      expect(state.currentTransaction).toBeNull();
    });
  });

  describe('setPaymentStatus', () => {
    it('should update paymentStatus to PROCESSING', () => {
      usePaymentStore.getState().setPaymentStatus(PaymentProcessingStatus.PROCESSING);
      
      const state = usePaymentStore.getState();
      expect(state.paymentStatus).toBe(PaymentProcessingStatus.PROCESSING);
    });

    it('should update paymentStatus to SUCCESS', () => {
      usePaymentStore.getState().setPaymentStatus(PaymentProcessingStatus.SUCCESS);
      
      const state = usePaymentStore.getState();
      expect(state.paymentStatus).toBe(PaymentProcessingStatus.SUCCESS);
    });

    it('should update paymentStatus to FAILED', () => {
      usePaymentStore.getState().setPaymentStatus(PaymentProcessingStatus.FAILED);
      
      const state = usePaymentStore.getState();
      expect(state.paymentStatus).toBe(PaymentProcessingStatus.FAILED);
    });
  });

  describe('setPrinterStatus', () => {
    it('should update printerStatus', () => {
      const newStatus: PrinterStatus = {
        isAvailable: true,
        isConnected: true,
      };

      usePaymentStore.getState().setPrinterStatus(newStatus);
      
      const state = usePaymentStore.getState();
      expect(state.printerStatus).toEqual(newStatus);
    });

    it('should update printerStatus with error', () => {
      const newStatus: PrinterStatus = {
        isAvailable: false,
        isConnected: false,
        error: 'Printer not found',
      };

      usePaymentStore.getState().setPrinterStatus(newStatus);
      
      const state = usePaymentStore.getState();
      expect(state.printerStatus).toEqual(newStatus);
    });
  });

  describe('resetPayment', () => {
    it('should reset transaction and payment status', () => {
      const mockTransaction: Transaction = {
        id: 'txn-123',
        amount: 100,
        currency: 'USD',
        paymentMethod: PaymentMethod.QR,
        status: TransactionStatus.PENDING,
        timestamp: new Date(),
        items: [],
        merchantInfo: {
          businessName: 'Test Store',
          address: '123 Main St',
          phone: '555-0100',
        },
        receiptNumber: 'RCP-001',
      };

      usePaymentStore.getState().setTransaction(mockTransaction);
      usePaymentStore.getState().setPaymentStatus(PaymentProcessingStatus.PROCESSING);
      usePaymentStore.getState().resetPayment();
      
      const state = usePaymentStore.getState();
      expect(state.currentTransaction).toBeNull();
      expect(state.paymentStatus).toBe(PaymentProcessingStatus.IDLE);
    });

    it('should not reset printer status', () => {
      const printerStatus: PrinterStatus = {
        isAvailable: true,
        isConnected: true,
      };

      usePaymentStore.getState().setPrinterStatus(printerStatus);
      usePaymentStore.getState().resetPayment();
      
      const state = usePaymentStore.getState();
      expect(state.printerStatus).toEqual(printerStatus);
    });
  });

  describe('Selectors', () => {
    it('selectCurrentTransaction should return current transaction', () => {
      const mockTransaction: Transaction = {
        id: 'txn-123',
        amount: 100,
        currency: 'USD',
        paymentMethod: PaymentMethod.QR,
        status: TransactionStatus.PENDING,
        timestamp: new Date(),
        items: [],
        merchantInfo: {
          businessName: 'Test Store',
          address: '123 Main St',
          phone: '555-0100',
        },
        receiptNumber: 'RCP-001',
      };

      usePaymentStore.getState().setTransaction(mockTransaction);
      
      const state = usePaymentStore.getState();
      expect(selectCurrentTransaction(state)).toEqual(mockTransaction);
    });

    it('selectPaymentStatus should return payment status', () => {
      usePaymentStore.getState().setPaymentStatus(PaymentProcessingStatus.PROCESSING);
      
      const state = usePaymentStore.getState();
      expect(selectPaymentStatus(state)).toBe(PaymentProcessingStatus.PROCESSING);
    });

    it('selectPrinterStatus should return printer status', () => {
      const printerStatus: PrinterStatus = {
        isAvailable: true,
        isConnected: true,
      };

      usePaymentStore.getState().setPrinterStatus(printerStatus);
      
      const state = usePaymentStore.getState();
      expect(selectPrinterStatus(state)).toEqual(printerStatus);
    });

    it('selectIsPaymentProcessing should return true when processing', () => {
      usePaymentStore.getState().setPaymentStatus(PaymentProcessingStatus.PROCESSING);
      
      const state = usePaymentStore.getState();
      expect(selectIsPaymentProcessing(state)).toBe(true);
    });

    it('selectIsPaymentProcessing should return false when not processing', () => {
      usePaymentStore.getState().setPaymentStatus(PaymentProcessingStatus.IDLE);
      
      const state = usePaymentStore.getState();
      expect(selectIsPaymentProcessing(state)).toBe(false);
    });

    it('selectIsPrinterAvailable should return true when printer is available and connected', () => {
      usePaymentStore.getState().setPrinterStatus({
        isAvailable: true,
        isConnected: true,
      });
      
      const state = usePaymentStore.getState();
      expect(selectIsPrinterAvailable(state)).toBe(true);
    });

    it('selectIsPrinterAvailable should return false when printer is not available', () => {
      usePaymentStore.getState().setPrinterStatus({
        isAvailable: false,
        isConnected: true,
      });
      
      const state = usePaymentStore.getState();
      expect(selectIsPrinterAvailable(state)).toBe(false);
    });

    it('selectIsPrinterAvailable should return false when printer is not connected', () => {
      usePaymentStore.getState().setPrinterStatus({
        isAvailable: true,
        isConnected: false,
      });
      
      const state = usePaymentStore.getState();
      expect(selectIsPrinterAvailable(state)).toBe(false);
    });
  });
});
