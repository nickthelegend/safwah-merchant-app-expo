# Backend Integration Guide

## Architecture Overview

This app follows a modular architecture for easy backend integration:

```
services/          # API service layer
  ├── api.ts       # All API endpoints
  └── types.ts     # TypeScript types for API responses

hooks/
  └── useApi.ts    # Generic hook for API calls

components/
  ├── home/        # Home screen components
  ├── common/      # Reusable components
  └── ui/          # Base UI components

stores/            # State management (Zustand)
```

## How to Integrate Backend APIs

### 1. Update API Base URL
Edit `services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-api.com';
```

### 2. Add Authentication
In `services/api.ts`, add auth token to headers:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

### 3. Use API Service in Components
```typescript
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';

// In component:
const { data, loading, error, refetch } = useApi(() => 
  apiService.getDashboardData()
);
```

### 4. Update Type Definitions
Edit `services/types.ts` to match your API response structure.

## Available API Methods

### Dashboard
- `getDashboardData()` - Get all dashboard data
- `getRevenueStats(date?)` - Get revenue statistics

### Transactions
- `getTransactions(params)` - List transactions
- `getTransactionById(id)` - Get single transaction
- `createTransaction(data)` - Create new transaction
- `refundTransaction(id, amount?)` - Process refund

### Payments
- `createPaymentQR(amount, currency)` - Generate QR code
- `processNFCPayment(data)` - Process NFC payment

### Merchant
- `getMerchantProfile()` - Get merchant profile
- `updateMerchantProfile(data)` - Update profile

### Terminal
- `getTerminalStatus()` - Get terminal status
- `syncTerminal()` - Sync terminal data

## Business Logic Gaps Identified

### Critical Missing Features:
1. **Authentication Flow**
   - No JWT token management
   - No refresh token logic
   - No session persistence

2. **Error Handling**
   - Need global error boundary
   - Need retry logic for failed requests
   - Need offline mode handling

3. **Payment Processing**
   - No payment verification flow
   - No webhook handling for async payments
   - No payment timeout handling

4. **Data Synchronization**
   - No conflict resolution for offline transactions
   - No queue for failed syncs
   - No optimistic updates

5. **Security**
   - No PIN encryption
   - No secure storage for sensitive data
   - No certificate pinning for API calls

6. **Analytics**
   - No event tracking
   - No error logging service
   - No performance monitoring

### Recommended Additions:

1. **Add Authentication Service**
```typescript
// services/auth.ts
class AuthService {
  async login(email, password)
  async logout()
  async refreshToken()
  getToken()
}
```

2. **Add Error Boundary**
```typescript
// components/common/ErrorBoundary.tsx
```

3. **Add Offline Queue**
```typescript
// services/offlineQueue.ts
class OfflineQueue {
  addToQueue(request)
  processQueue()
  clearQueue()
}
```

4. **Add Analytics**
```typescript
// services/analytics.ts
class Analytics {
  trackEvent(name, properties)
  trackScreen(name)
  trackError(error)
}
```

## Environment Variables

Create `.env` file:
```
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Testing API Integration

1. Use mock data initially (already in place)
2. Test with Postman/Insomnia first
3. Implement error scenarios
4. Test offline behavior
5. Test with real backend

## State Management

Using Zustand stores:
- `merchantStore.ts` - Merchant settings
- `terminalStore.ts` - Terminal status
- `cartStore.ts` - Shopping cart

Backend devs can update these stores after API calls.
