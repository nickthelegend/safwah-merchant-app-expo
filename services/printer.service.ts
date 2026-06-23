// PrinterService - Handles IMIN thermal printer operations
// Requirements: 4.1, 4.2, 4.3, 3.1, 3.2, 3.3, 3.4, 3.5

import IminPrinter from 'react-native-printer-imin';
import {
  InitializationResult,
  PrinterStatus,
  PrintResult,
  Transaction
} from './payment-types';

class PrinterService {
  private isInitialized: boolean = false;
  private printerStatus: PrinterStatus = {
    isAvailable: false,
    isConnected: false,
  };

  /**
   * Initialize the IMIN printer connection
   * Requirements: 4.1, 4.2, 4.3
   * 
   * This method attempts to connect to the IMIN printer hardware.
   * If initialization fails, it logs the error and continues without blocking.
   */
  async initialize(): Promise<InitializationResult> {
    try {
      // Initialize the IMIN printer SDK
      await IminPrinter.initPrinter();
      
      this.isInitialized = true;
      
      // Retrieve printer status after initialization
      const status = await this.getStatus();
      
      console.log('Printer initialized successfully:', status);
      
      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      // Log error but don't throw - app should continue without printer
      const errorMessage = error instanceof Error ? error.message : 'Unknown printer initialization error';
      console.error('Printer initialization failed:', errorMessage);
      
      this.isInitialized = false;
      this.printerStatus = {
        isAvailable: false,
        isConnected: false,
        error: errorMessage,
      };
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get current printer status
   * Requirements: 4.2, 4.3
   * 
   * Checks printer availability and connection status.
   * Returns cached status if printer is not initialized.
   */
  async getStatus(): Promise<PrinterStatus> {
    if (!this.isInitialized) {
      return {
        isAvailable: false,
        isConnected: false,
        error: 'Printer not initialized',
      };
    }

    try {
      // Check printer status using IMIN SDK
      const printerStatus = await IminPrinter.getPrinterStatus();
      
      // IMIN printer returns an object with code and message
      // code 0 = Normal/Ready
      // Other values indicate various error states
      const isReady = printerStatus.code === 0;
      
      this.printerStatus = {
        isAvailable: true,
        isConnected: isReady,
        error: isReady ? undefined : printerStatus.message || `Printer status code: ${printerStatus.code}`,
      };
      
      return this.printerStatus;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown printer status error';
      
      this.printerStatus = {
        isAvailable: false,
        isConnected: false,
        error: errorMessage,
      };
      
      return this.printerStatus;
    }
  }

  /**
   * Format receipt content with transaction details
   * Requirements: 3.3
   * 
   * Creates formatted receipt text including:
   * - Merchant information
   * - Transaction ID and timestamp
   * - Itemized list with quantities and prices
   * - Total amount
   */
  formatReceipt(transaction: Transaction): string {
    const { merchantInfo, items, amount, currency, receiptNumber, timestamp, id } = transaction;
    
    // Build receipt content
    let receipt = '';
    
    // Header - Merchant Info
    receipt += `${merchantInfo.businessName}\n`;
    receipt += `${merchantInfo.address}\n`;
    receipt += `${merchantInfo.phone}\n`;
    if (merchantInfo.taxId) {
      receipt += `Tax ID: ${merchantInfo.taxId}\n`;
    }
    receipt += '\n';
    
    // Receipt details
    receipt += `Receipt #: ${receiptNumber}\n`;
    receipt += `Transaction ID: ${id}\n`;
    receipt += `Date: ${timestamp.toLocaleString()}\n`;
    receipt += '\n';
    
    // Separator
    receipt += '================================\n';
    
    // Items
    items.forEach(item => {
      receipt += `${item.name}\n`;
      receipt += `  ${item.quantity} x ${currency} ${item.unitPrice.toFixed(2)} = ${currency} ${item.totalPrice.toFixed(2)}\n`;
    });
    
    // Separator
    receipt += '================================\n';
    
    // Total
    receipt += `TOTAL: ${currency} ${amount.toFixed(2)}\n`;
    receipt += '\n';
    
    // Footer
    receipt += 'Thank you for your business!\n';
    receipt += '\n';
    
    return receipt;
  }

  /**
   * Print receipt for a transaction
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
   * 
   * Checks printer status, formats receipt, and sends to printer.
   * Includes retry logic for printer errors.
   */
  async printReceipt(transaction: Transaction, retryCount: number = 0): Promise<PrintResult> {
    const MAX_RETRIES = 2;
    
    try {
      // Check printer status before attempting to print (Requirement 3.2)
      const status = await this.getStatus();
      
      if (!status.isAvailable || !status.isConnected) {
        return {
          success: false,
          error: status.error || 'Printer not available',
          errorType: this.categorizeError(status.error || 'Printer not available'),
        };
      }
      
      // Format receipt content (Requirement 3.3)
      const receiptText = this.formatReceipt(transaction);
      
      // Print using IMIN SDK
      await IminPrinter.printText(receiptText);
      await IminPrinter.printAndFeedPaper(100); // Feed paper to cut line
      
      // Return success result (Requirement 3.5)
      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown print error';
      
      // Retry logic for printer errors (Requirement 3.4)
      if (retryCount < MAX_RETRIES) {
        console.log(`Print failed, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return this.printReceipt(transaction, retryCount + 1);
      }
      
      // Return error result after max retries (Requirement 3.4)
      return {
        success: false,
        error: errorMessage,
        errorType: this.categorizeError(errorMessage),
      };
    }
  }

  /**
   * Print receipt directly (simplified method that works)
   * Use this method for manual printing from UI buttons
   */
  async printReceiptDirect(transaction: Transaction): Promise<PrintResult> {
    try {
      // Format receipt content
      const receiptText = this.formatReceipt(transaction);
      
      // Print using IMIN SDK - access via default export (this is what works in the test)
      const PrinterModule = require('react-native-printer-imin').default;
      await PrinterModule.printText(receiptText);
      await PrinterModule.printAndFeedPaper(100);
      
      console.log('Receipt printed successfully');
      
      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown print error';
      console.error('Print error:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        errorType: this.categorizeError(errorMessage),
      };
    }
  }

  /**
   * Categorize printer error for better user feedback
   * Requirements: 3.4
   */
  private categorizeError(errorMessage: string): 'not_found' | 'not_connected' | 'paper_out' | 'busy' | 'connection_lost' | 'unknown' {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('not found') || lowerError.includes('not detected')) {
      return 'not_found';
    }
    
    if (lowerError.includes('not connected') || lowerError.includes('disconnected')) {
      return 'not_connected';
    }
    
    if (lowerError.includes('paper') || lowerError.includes('out of paper')) {
      return 'paper_out';
    }
    
    if (lowerError.includes('busy') || lowerError.includes('in use')) {
      return 'busy';
    }
    
    if (lowerError.includes('connection lost') || lowerError.includes('lost connection')) {
      return 'connection_lost';
    }
    
    return 'unknown';
  }
}

// Export singleton instance
export const printerService = new PrinterService();
