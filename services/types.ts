// Type definitions for API responses - Backend devs can update these

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paymentMethod: 'qr' | 'nfc' | 'manual';
  timestamp: string;
  customerInfo?: {
    name?: string;
    email?: string;
  };
}

export interface RevenueStats {
  totalAmount: number;
  currency: string;
  cryptoBreakdown: {
    usdc: number;
    algo: number;
  };
  percentageChange: number;
  transactionCount: number;
  comparisonPeriod: 'yesterday' | 'last_week' | 'last_month';
}

export interface DashboardData {
  revenue: RevenueStats;
  quickStats: {
    dailyGoalProgress: number;
    avgTransaction: number;
    peakHours: string;
    customerCount: number;
  };
  recentActivity: Transaction[];
  terminalStatus: {
    nfc: 'connected' | 'disconnected' | 'error';
    cloudSync: 'connected' | 'disconnected' | 'syncing';
  };
}

export interface MerchantProfile {
  id: string;
  businessName: string;
  businessCategory: string;
  currency: string;
  email: string;
  phone?: string;
  address?: string;
  settings: {
    notifications: boolean;
    autoSync: boolean;
    receiptEmail: boolean;
  };
}

export interface PaymentQRResponse {
  qrCode: string;
  paymentId: string;
  expiresAt: string;
  amount: number;
  currency: string;
}
