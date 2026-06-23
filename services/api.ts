// API Service Layer - Backend developers can easily integrate endpoints here

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard APIs
  async getDashboardData() {
    return this.request('/dashboard');
  }

  async getRevenueStats(date?: string) {
    return this.request(`/revenue/stats${date ? `?date=${date}` : ''}`);
  }

  // Transaction APIs
  async getTransactions(params?: { page?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/transactions${query ? `?${query}` : ''}`);
  }

  async getTransactionById(id: string) {
    return this.request(`/transactions/${id}`);
  }

  async createTransaction(data: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refundTransaction(id: string, amount?: number) {
    return this.request(`/transactions/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Payment APIs
  async createPaymentQR(amount: number, currency: string) {
    return this.request('/payments/qr', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  async processNFCPayment(data: any) {
    return this.request('/payments/nfc', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Merchant APIs
  async getMerchantProfile() {
    return this.request('/merchant/profile');
  }

  async updateMerchantProfile(data: any) {
    return this.request('/merchant/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Terminal APIs
  async getTerminalStatus() {
    return this.request('/terminal/status');
  }

  async syncTerminal() {
    return this.request('/terminal/sync', { method: 'POST' });
  }
}

export const apiService = new ApiService();
