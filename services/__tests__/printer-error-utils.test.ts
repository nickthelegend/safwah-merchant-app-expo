// Printer error utilities tests
// Requirements: 3.4

import { getPrinterErrorMessage, getPrinterErrorType, isPrinterErrorRecoverable } from '../printer-error-utils';

describe('Printer Error Utilities', () => {
  describe('getPrinterErrorType', () => {
    it('should identify not_found error', () => {
      expect(getPrinterErrorType('Printer not found')).toBe('not_found');
      expect(getPrinterErrorType('Device not detected')).toBe('not_found');
    });

    it('should identify not_connected error', () => {
      expect(getPrinterErrorType('Printer not connected')).toBe('not_connected');
      expect(getPrinterErrorType('Device disconnected')).toBe('not_connected');
    });

    it('should identify paper_out error', () => {
      expect(getPrinterErrorType('Out of paper')).toBe('paper_out');
      expect(getPrinterErrorType('Paper jam detected')).toBe('paper_out');
    });

    it('should identify busy error', () => {
      expect(getPrinterErrorType('Printer is busy')).toBe('busy');
      expect(getPrinterErrorType('Device in use')).toBe('busy');
    });

    it('should identify connection_lost error', () => {
      expect(getPrinterErrorType('Connection lost')).toBe('connection_lost');
      expect(getPrinterErrorType('Lost connection to printer')).toBe('connection_lost');
    });

    it('should return unknown for unrecognized errors', () => {
      expect(getPrinterErrorType('Some random error')).toBe('unknown');
      expect(getPrinterErrorType('')).toBe('unknown');
    });
  });

  describe('getPrinterErrorMessage', () => {
    it('should return appropriate message for each error type', () => {
      expect(getPrinterErrorMessage('not_found')).toContain('detect');
      expect(getPrinterErrorMessage('not_connected')).toContain('connected');
      expect(getPrinterErrorMessage('paper_out')).toContain('paper');
      expect(getPrinterErrorMessage('busy')).toContain('busy');
      expect(getPrinterErrorMessage('connection_lost')).toContain('connection');
    });

    it('should return original error for unknown type', () => {
      const originalError = 'Custom error message';
      expect(getPrinterErrorMessage('unknown', originalError)).toBe(originalError);
    });

    it('should return default message for unknown type without original error', () => {
      expect(getPrinterErrorMessage('unknown')).toContain('unknown');
    });
  });

  describe('isPrinterErrorRecoverable', () => {
    it('should return false for not_found error', () => {
      expect(isPrinterErrorRecoverable('not_found')).toBe(false);
    });

    it('should return true for recoverable errors', () => {
      expect(isPrinterErrorRecoverable('not_connected')).toBe(true);
      expect(isPrinterErrorRecoverable('paper_out')).toBe(true);
      expect(isPrinterErrorRecoverable('busy')).toBe(true);
      expect(isPrinterErrorRecoverable('connection_lost')).toBe(true);
      expect(isPrinterErrorRecoverable('unknown')).toBe(true);
    });
  });
});
