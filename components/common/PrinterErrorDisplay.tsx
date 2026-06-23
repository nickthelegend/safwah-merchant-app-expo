// PrinterErrorDisplay - Specialized error display for printer-related errors
// Requirements: 3.4

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../ui/Button';

export type PrinterErrorType = 
  | 'not_found'
  | 'not_connected'
  | 'paper_out'
  | 'busy'
  | 'connection_lost'
  | 'unknown';

interface PrinterErrorDisplayProps {
  errorType: PrinterErrorType;
  errorMessage?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export const PrinterErrorDisplay: React.FC<PrinterErrorDisplayProps> = ({
  errorType,
  errorMessage,
  onRetry,
  onDismiss,
  compact = false,
}) => {
  const getErrorDetails = () => {
    switch (errorType) {
      case 'not_found':
        return {
          icon: 'print' as const,
          title: 'Printer Not Found',
          message: 'Unable to detect the thermal printer. Please check the connection.',
          actionable: true,
        };
      case 'not_connected':
        return {
          icon: 'print' as const,
          title: 'Printer Not Connected',
          message: 'The printer is not connected. Please check the device connection.',
          actionable: true,
        };
      case 'paper_out':
        return {
          icon: 'document-text' as const,
          title: 'Paper Out',
          message: 'The printer is out of paper. Please refill the paper roll and try again.',
          actionable: true,
        };
      case 'busy':
        return {
          icon: 'time' as const,
          title: 'Printer Busy',
          message: 'The printer is currently busy. Please wait a moment and try again.',
          actionable: true,
        };
      case 'connection_lost':
        return {
          icon: 'wifi-off' as const,
          title: 'Connection Lost',
          message: 'Lost connection to the printer. Attempting to reconnect...',
          actionable: true,
        };
      case 'unknown':
      default:
        return {
          icon: 'alert-circle' as const,
          title: 'Printer Error',
          message: errorMessage || 'An unknown printer error occurred.',
          actionable: true,
        };
    }
  };

  const details = getErrorDetails();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactContent}>
          <Ionicons name={details.icon} size={20} color={theme.colors.warning} />
          <Text style={styles.compactMessage}>{details.title}</Text>
        </View>
        {onRetry && (
          <Button
            title="Retry"
            onPress={onRetry}
            variant="secondary"
            style={styles.compactButton}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name={details.icon} size={48} color={theme.colors.warning} />
      </View>
      <Text style={styles.title}>{details.title}</Text>
      <Text style={styles.message}>{details.message}</Text>
      
      <View style={styles.buttonContainer}>
        {onRetry && details.actionable && (
          <Button
            title="Retry Print"
            onPress={onRetry}
            variant="primary"
            style={styles.button}
          />
        )}
        {onDismiss && (
          <Button
            title="Continue Without Receipt"
            onPress={onDismiss}
            variant="secondary"
            style={styles.button}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${theme.colors.warning}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.warning,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  button: {
    width: '100%',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${theme.colors.warning}20`,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactMessage: {
    ...theme.typography.body,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    fontWeight: '600',
  },
  compactButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minWidth: 80,
  },
});
