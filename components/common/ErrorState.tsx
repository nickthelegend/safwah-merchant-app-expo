// ErrorState - Enhanced error display with retry functionality
// Requirements: 7.3

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  message: string;
  title?: string;
  submessage?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message,
  title = 'Oops!',
  submessage,
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  dismissLabel = 'Dismiss',
  icon = 'alert-circle',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={48} color={theme.colors.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {submessage && (
        <Text style={styles.submessage}>{submessage}</Text>
      )}
      <View style={styles.buttonContainer}>
        {onRetry && (
          <Button 
            title={retryLabel} 
            onPress={onRetry} 
            variant="primary"
            style={styles.button} 
          />
        )}
        {onDismiss && (
          <Button 
            title={dismissLabel} 
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
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: theme.spacing.xl,
  },
  iconWrapper: { 
    width: 96, 
    height: 96, 
    borderRadius: 48, 
    backgroundColor: `${theme.colors.error}20`, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: theme.spacing.lg,
  },
  title: { 
    ...theme.typography.h2, 
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  message: { 
    ...theme.typography.body, 
    color: theme.colors.textSecondary, 
    textAlign: 'center', 
    marginBottom: theme.spacing.md,
  },
  submessage: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  button: { 
    minWidth: 200,
  },
});
