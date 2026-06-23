// Printer error utilities - Helper functions for printer error handling
// Requirements: 3.4

import { PrinterErrorType } from '../components/common/PrinterErrorDisplay';

/**
 * Determine the printer error type from an error message
 */
export const getPrinterErrorType = (errorMessage: string): PrinterErrorType => {
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
};

/**
 * Get user-friendly error message for printer errors
 */
export const getPrinterErrorMessage = (errorType: PrinterErrorType, originalError?: string): string => {
  switch (errorType) {
    case 'not_found':
      return 'Unable to detect the thermal printer. Please check the connection.';
    case 'not_connected':
      return 'The printer is not connected. Please check the device connection.';
    case 'paper_out':
      return 'The printer is out of paper. Please refill the paper roll and try again.';
    case 'busy':
      return 'The printer is currently busy. Please wait a moment and try again.';
    case 'connection_lost':
      return 'Lost connection to the printer. Attempting to reconnect...';
    case 'unknown':
    default:
      return originalError || 'An unknown printer error occurred.';
  }
};

/**
 * Check if a printer error is recoverable (can be retried)
 */
export const isPrinterErrorRecoverable = (errorType: PrinterErrorType): boolean => {
  return errorType !== 'not_found';
};
