// LoadingState - Enhanced loading indicator with status messages
// Requirements: 7.1

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'large';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...',
  submessage,
  icon,
  size = 'large',
}) => {
  return (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={48} color={theme.colors.primary} />
        </View>
      )}
      <ActivityIndicator 
        size={size} 
        color={theme.colors.primary} 
        style={styles.spinner}
      />
      <Text style={styles.message}>{message}</Text>
      {submessage && (
        <Text style={styles.submessage}>{submessage}</Text>
      )}
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
  iconContainer: {
    marginBottom: theme.spacing.md,
  },
  spinner: {
    marginBottom: theme.spacing.md,
  },
  message: { 
    ...theme.typography.body, 
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  submessage: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
