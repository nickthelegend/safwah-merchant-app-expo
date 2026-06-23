// Type definitions for Payment Methods Integration
// This file contains all types for QR payments, NFC payments, and receipt printing

// ============================================================================
// Enums
// ============================================================================

export enum PaymentMethod {
  QR = 'qr',
  NFC = 'nfc',
  CASH = 'cash',
  CARD = 'card',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentProcessingStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// ============================================================================
// Core Transaction Types
// ============================================================================

export interface TransactionItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface MerchantInfo {
  businessName: string;
  address: string;
  phone: string;
  taxId?: string;
  logo?: string;
}

export interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  timestamp: Date;
  items: TransactionItem[];
  merchantInfo: MerchantInfo;
  customerInfo?: CustomerInfo;
  receiptNumber: string;
}

// ============================================================================
// Payment Service Types
// ============================================================================

export interface PaymentMetadata {
  orderId?: string;
  customerId?: string;
  description?: string;
  items: TransactionItem[];
}

export interface QRPaymentData {
  qrContent: string;
  transactionId: string;
  amount: number;
  merchantInfo: MerchantInfo;
  expiresAt: Date;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  timestamp: Date;
  paymentMethod: PaymentMethod;
  error?: string;
}

// ============================================================================
// Printer Service Types
// ============================================================================

export interface PrinterStatus {
  isAvailable: boolean;
  isConnected: boolean;
  error?: string;
}

export interface PrintResult {
  success: boolean;
  error?: string;
  errorType?: 'not_found' | 'not_connected' | 'paper_out' | 'busy' | 'connection_lost' | 'unknown';
}

// ============================================================================
// NFC Service Types
// ============================================================================

export interface NFCAvailability {
  isSupported: boolean;
  isEnabled: boolean;
  error?: string;
}

export interface NFCPaymentData {
  cardNumber?: string;
  cardType?: string;
  rawData: any;
}

// ============================================================================
// Service Result Types (for error handling)
// ============================================================================

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type InitializationResult = ServiceResult<void>;
export type PrintServiceResult = ServiceResult<PrintResult>;
export type PaymentServiceResult = ServiceResult<PaymentResult>;
export type QRPaymentServiceResult = ServiceResult<QRPaymentData>;
export type NFCAvailabilityResult = ServiceResult<NFCAvailability>;
