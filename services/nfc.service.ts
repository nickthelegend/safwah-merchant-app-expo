// NFCService - Handles NFC contactless payment scanning
// Requirements: 2.1, 2.3, 2.4, 6.2

import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import {
    InitializationResult,
    NFCAvailabilityResult,
    NFCPaymentData,
    PaymentMethod,
    PaymentResult,
    PaymentServiceResult
} from './payment-types';

// Mock payment configuration for development
const MOCK_NFC_PAYMENT_DELAY = 500; // 0.5 seconds for NFC payment simulation

class NFCService {
  private isInitialized: boolean = false;
  private isScanning: boolean = false;
  private currentAmount: number = 0;

  /**
   * Initialize NFC manager
   * Requirements: 2.1
   * 
   * Sets up the NFC manager for reading NFC tags.
   * Must be called before any NFC operations.
   */
  async initialize(): Promise<InitializationResult> {
    try {
      // Initialize NFC Manager
      await NfcManager.start();
      
      this.isInitialized = true;
      
      console.log('NFC Manager initialized successfully');
      
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      // Log error but don't throw - app should continue without NFC
      const errorMessage = error instanceof Error ? error.message : 'Unknown NFC initialization error';
      console.error('NFC initialization failed:', errorMessage);
      
      this.isInitialized = false;
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if NFC is supported and enabled
   * Requirements: 2.1
   * 
   * Verifies that the device supports NFC and that it's currently enabled.
   * Returns detailed availability information.
   */
  async isAvailable(): Promise<NFCAvailabilityResult> {
    try {
      // Check if NFC is supported on the device
      const isSupported = await NfcManager.isSupported();
      
      if (!isSupported) {
        return {
          success: true,
          data: {
            isSupported: false,
            isEnabled: false,
            error: 'NFC is not supported on this device',
          },
        };
      }

      // Check if NFC is enabled
      const isEnabled = await NfcManager.isEnabled();
      
      if (!isEnabled) {
        return {
          success: true,
          data: {
            isSupported: true,
            isEnabled: false,
            error: 'NFC is disabled. Please enable NFC in device settings',
          },
        };
      }

      // NFC is supported and enabled
      return {
        success: true,
        data: {
          isSupported: true,
          isEnabled: true,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown NFC availability error';
      console.error('Error checking NFC availability:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Start NFC scanning session
   * Requirements: 2.3
   * 
   * Begins listening for NFC tags. The amount is stored for payment processing.
   * Call stopScanning() to end the session.
   * 
   * @param amount - Payment amount for the transaction
   */
  async startScanning(amount: number): Promise<InitializationResult> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'NFC Manager not initialized. Call initialize() first.',
        };
      }

      if (this.isScanning) {
        console.log('NFC scanning already in progress, stopping previous session first');
        // Stop any existing session before starting a new one
        await this.stopScanning();
      }

      // Try to cancel any lingering technology requests
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (e) {
        // Ignore errors - there might not be an active request
        console.log('No active NFC request to cancel');
      }

      // Store amount for payment processing
      this.currentAmount = amount;

      // Request NFC technology (ISO 14443 for contactless cards)
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      this.isScanning = true;
      
      console.log('NFC scanning started for amount:', amount);
      
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start NFC scanning';
      console.error('Error starting NFC scan:', errorMessage);
      
      this.isScanning = false;
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Stop NFC scanning session
   * Requirements: 2.3
   * 
   * Ends the current NFC scanning session and releases resources.
   */
  async stopScanning(): Promise<void> {
    try {
      if (this.isScanning) {
        await NfcManager.cancelTechnologyRequest();
        this.isScanning = false;
        this.currentAmount = 0;
        console.log('NFC scanning stopped');
      }
    } catch (error) {
      console.error('Error stopping NFC scan:', error);
      // Force reset state even if cancel fails
      this.isScanning = false;
      this.currentAmount = 0;
    }
  }

  /**
   * Process NFC payment data
   * Requirements: 2.3, 2.4, 6.2
   * 
   * Processes NFC tag data and creates a payment transaction.
   * In development mode, this simulates successful payment processing.
   * 
   * @param nfcData - Raw NFC data read from the tag
   * @returns Payment result with transaction details
   */
  async processNFCPayment(nfcData: any): Promise<PaymentServiceResult> {
    try {
      // Guard: a null/undefined payload means the tag read failed — never treat an
      // absent read as a successful payment, even in auto-complete/demo mode.
      if (nfcData === null || nfcData === undefined) {
        return {
          success: false,
          error: 'Invalid NFC data',
        };
      }

      // DEBUG: Log all NFC data in detail
      console.log('═══════════════════════════════════════');
      console.log('🔍 NFC DATA RECEIVED IN PAYMENT PROCESSOR:');
      console.log('═══════════════════════════════════════');
      console.log('📦 Raw NFC Data (Full Object):');
      console.log(JSON.stringify(nfcData, null, 2));
      console.log('');
      console.log('📊 Data Analysis:');
      console.log('  - Type:', typeof nfcData);
      console.log('  - Is Null:', nfcData === null);
      console.log('  - Is Undefined:', nfcData === undefined);
      console.log('  - Keys:', nfcData ? Object.keys(nfcData) : 'N/A');
      console.log('');
      
      // Log specific fields if they exist
      if (nfcData) {
        console.log('🏷️  Tag Properties:');
        console.log('  - ID:', nfcData.id);
        console.log('  - Type:', nfcData.type);
        console.log('  - Tech Types:', nfcData.techTypes);
        console.log('  - Max Size:', nfcData.maxSize);
        console.log('  - Is Writable:', nfcData.isWritable);
        console.log('');
        console.log('📝 NDEF Message:', nfcData.ndefMessage);
        if (nfcData.ndefMessage && Array.isArray(nfcData.ndefMessage)) {
          console.log('  - NDEF Records Count:', nfcData.ndefMessage.length);
          nfcData.ndefMessage.forEach((record: any, index: number) => {
            console.log(`  - Record ${index}:`, JSON.stringify(record, null, 2));
          });
        }
      }
      console.log('═══════════════════════════════════════');

      // Extract payment information from NFC data (no validation - accept anything)
      const paymentData: NFCPaymentData = this.extractPaymentData(nfcData);
      console.log('💳 Extracted Payment Data:', paymentData);

      // Generate transaction ID
      const transactionId = this.generateTransactionId();
      console.log('🆔 Generated Transaction ID:', transactionId);

      // AUTO-COMPLETE: Any NFC scan = successful payment (instant, no delay)
      console.log('✅ AUTO-COMPLETING PAYMENT (any NFC = paid)');
      console.log('💰 Payment Amount:', this.currentAmount);

      // Generate realistic payment result (instant processing)
      // Requirement 6.2: Simulate successful card reading and payment processing
      const paymentResult: PaymentResult = {
        success: true,
        transactionId,
        amount: this.currentAmount,
        timestamp: new Date(),
        paymentMethod: PaymentMethod.NFC,
      };

      console.log('✅ NFC payment processed successfully:', transactionId);
      console.log('═══════════════════════════════════════');

      return {
        success: true,
        data: paymentResult,
      };
    } catch (error) {
      // Requirement 2.4: Handle NFC reading failures
      const errorMessage = error instanceof Error ? error.message : 'Failed to process NFC payment';
      console.error('❌ Error processing NFC payment:', errorMessage);
      console.error('Error details:', error);
      console.log('═══════════════════════════════════════');
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Extract payment data from NFC tag
   * 
   * Parses the raw NFC data to extract payment information.
   * In production, this would parse standardized payment protocols.
   */
  private extractPaymentData(nfcData: any): NFCPaymentData {
    // In production, this would parse EMV or other payment protocols
    // For development, we extract basic information
    
    const paymentData: NFCPaymentData = {
      rawData: nfcData,
    };

    // Try to extract card information if available
    try {
      if (nfcData.id) {
        // Card UID can be used as a card identifier
        paymentData.cardNumber = nfcData.id;
      }

      if (nfcData.type) {
        paymentData.cardType = nfcData.type;
      }
    } catch (error) {
      console.warn('Could not extract detailed card info:', error);
    }

    return paymentData;
  }

  /**
   * Generate unique transaction ID
   * Format: NFC-{timestamp}-{random}
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `NFC-${timestamp}-${random}`;
  }

  /**
   * Get current scanning status (for debugging/testing)
   */
  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  /**
   * Get initialization status (for debugging/testing)
   */
  isNFCInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Broadcast transaction details via NFC
   * Requirements: NEW - NFC broadcasting for transaction sharing
   * 
   * Writes transaction data to an NFC tag or broadcasts via peer-to-peer.
   * This allows the merchant device to share transaction details with customer devices.
   * 
   * @param transactionData - Transaction details to broadcast
   * @returns Result indicating success or failure
   */
  async broadcastTransaction(transactionData: {
    transactionId: string;
    amount: number;
    merchantInfo: {
      businessName: string;
      address: string;
      phone: string;
    };
    timestamp: Date;
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<InitializationResult> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'NFC Manager not initialized. Call initialize() first.',
        };
      }

      // Convert transaction data to JSON
      const jsonData = JSON.stringify({
        transactionId: transactionData.transactionId,
        amount: transactionData.amount,
        merchantInfo: transactionData.merchantInfo,
        timestamp: transactionData.timestamp.toISOString(),
        items: transactionData.items || [],
        type: 'MERCHANT_TRANSACTION',
        version: '1.0',
      });

      console.log('Broadcasting transaction data:', jsonData);

      // Request NFC technology for writing
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Create NDEF message with transaction data
      const bytes = this.stringToBytes(jsonData);
      const ndefMessage = [
        {
          tnf: 1, // TNF Well Known
          type: this.stringToBytes('T'), // Text record
          payload: bytes,
        },
      ];

      // Write NDEF message to tag
      await NfcManager.writeNdefMessage(ndefMessage);

      console.log('Transaction data broadcasted successfully');

      // Cancel technology request
      await NfcManager.cancelTechnologyRequest();

      return {
        success: true,
        data: {
          message: 'Transaction data broadcasted successfully',
          dataSize: jsonData.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to broadcast transaction';
      console.error('Error broadcasting transaction:', errorMessage);

      // Try to cancel technology request
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (cancelError) {
        console.error('Error canceling NFC request:', cancelError);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Start broadcasting mode (wait for NFC tag to write to)
   * 
   * Prepares the device to write transaction data when an NFC tag is detected.
   * Call this before bringing an NFC tag near the device.
   * 
   * @param transactionData - Transaction details to broadcast
   * @returns Result indicating if broadcasting mode started
   */
  async startBroadcastMode(transactionData: {
    transactionId: string;
    amount: number;
    merchantInfo: {
      businessName: string;
      address: string;
      phone: string;
    };
    timestamp: Date;
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }): Promise<InitializationResult> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'NFC Manager not initialized. Call initialize() first.',
        };
      }

      // Convert transaction data to JSON
      const jsonData = JSON.stringify({
        transactionId: transactionData.transactionId,
        amount: transactionData.amount,
        merchantInfo: transactionData.merchantInfo,
        timestamp: transactionData.timestamp.toISOString(),
        items: transactionData.items || [],
        type: 'MERCHANT_TRANSACTION',
        version: '1.0',
      });

      console.log('Starting broadcast mode with data:', jsonData);

      // Store data for broadcasting
      this.currentAmount = transactionData.amount;

      return {
        success: true,
        data: {
          message: 'Broadcast mode ready. Bring NFC tag near device.',
          dataSize: jsonData.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start broadcast mode';
      console.error('Error starting broadcast mode:', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Stop broadcasting mode
   */
  async stopBroadcastMode(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
      console.log('Broadcast mode stopped');
    } catch (error) {
      console.error('Error stopping broadcast mode:', error);
    }
  }

  /**
   * Helper: Convert string to byte array for NFC
   */
  private stringToBytes(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }

  /**
   * Helper: Convert byte array to string
   */
  private bytesToString(bytes: number[]): string {
    return String.fromCharCode(...bytes);
  }
}

// Export singleton instance
export const nfcService = new NFCService();
