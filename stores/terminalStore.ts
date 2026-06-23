import { create } from 'zustand';

export type TerminalStatus = 'connected' | 'disconnected' | 'connecting';
export type PaymentStatus = 'idle' | 'pending' | 'confirmed' | 'failed' | 'timeout';

interface TerminalStore {
  nfcStatus: TerminalStatus;
  cloudSyncStatus: TerminalStatus;
  paymentStatus: PaymentStatus;
  currentPayment?: {
    amount: number;
    currency: string;
    txId?: string;
  };
  setNfcStatus: (status: TerminalStatus) => void;
  setCloudSyncStatus: (status: TerminalStatus) => void;
  setPaymentStatus: (status: PaymentStatus) => void;
  startPayment: (amount: number, currency: string) => void;
  completePayment: (txId: string) => void;
  resetPayment: () => void;
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  nfcStatus: 'disconnected',
  cloudSyncStatus: 'connected',
  paymentStatus: 'idle',
  currentPayment: undefined,
  
  setNfcStatus: (status) => set({ nfcStatus: status }),
  setCloudSyncStatus: (status) => set({ cloudSyncStatus: status }),
  setPaymentStatus: (status) => set({ paymentStatus: status }),
  
  startPayment: (amount, currency) => {
    set({
      currentPayment: { amount, currency },
      paymentStatus: 'pending'
    });
  },
  
  completePayment: (txId) => {
    set((state) => ({
      currentPayment: state.currentPayment ? { ...state.currentPayment, txId } : undefined,
      paymentStatus: 'confirmed'
    }));
  },
  
  resetPayment: () => {
    set({
      currentPayment: undefined,
      paymentStatus: 'idle'
    });
  },
}));