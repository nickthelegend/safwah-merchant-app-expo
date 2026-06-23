import { create } from 'zustand';

interface MerchantSettings {
  businessName: string;
  businessCategory: string;
  currency: string;
  merchantPin: string;
  walletAddress?: string;
}

interface MerchantStore {
  settings: MerchantSettings;
  isSetupComplete: boolean;
  updateSettings: (settings: Partial<MerchantSettings>) => void;
  completeSetup: () => void;
}

export const useMerchantStore = create<MerchantStore>((set) => ({
  settings: {
    businessName: '',
    businessCategory: '',
    currency: 'USD',
    merchantPin: '',
  },
  isSetupComplete: false,
  
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },
  
  completeSetup: () => {
    set({ isSetupComplete: true });
  },
}));