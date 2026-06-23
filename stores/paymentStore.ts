import { create } from 'zustand';
import {
    PaymentProcessingStatus,
    PrinterStatus,
    Transaction
} from '../services/payment-types';

interface PaymentStore {
  // State
  currentTransaction: Transaction | null;
  paymentStatus: PaymentProcessingStatus;
  printerStatus: PrinterStatus;
  
  // Actions
  setTransaction: (transaction: Transaction | null) => void;
  setPaymentStatus: (status: PaymentProcessingStatus) => void;
  setPrinterStatus: (status: PrinterStatus) => void;
  resetPayment: () => void;
}

const initialPrinterStatus: PrinterStatus = {
  isAvailable: false,
  isConnected: false,
};

export const usePaymentStore = create<PaymentStore>((set) => ({
  // Initial state
  currentTransaction: null,
  paymentStatus: PaymentProcessingStatus.IDLE,
  printerStatus: initialPrinterStatus,
  
  // Actions
  setTransaction: (transaction) => {
    set({ currentTransaction: transaction });
  },
  
  setPaymentStatus: (status) => {
    set({ paymentStatus: status });
  },
  
  setPrinterStatus: (status) => {
    set({ printerStatus: status });
  },
  
  resetPayment: () => {
    set({
      currentTransaction: null,
      paymentStatus: PaymentProcessingStatus.IDLE,
    });
  },
}));

// Selectors for accessing payment state
export const selectCurrentTransaction = (state: PaymentStore) => state.currentTransaction;
export const selectPaymentStatus = (state: PaymentStore) => state.paymentStatus;
export const selectPrinterStatus = (state: PaymentStore) => state.printerStatus;
export const selectIsPaymentProcessing = (state: PaymentStore) => 
  state.paymentStatus === PaymentProcessingStatus.PROCESSING;
export const selectIsPrinterAvailable = (state: PaymentStore) => 
  state.printerStatus.isAvailable && state.printerStatus.isConnected;
