import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { theme } from '../../theme';

// Conditional import for LinearGradient
let LinearGradient: any;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  // Fallback for web or if expo-linear-gradient is not available
  LinearGradient = ({ children, colors, style, ...props }: any) => (
    <View style={[style, { backgroundColor: colors[0] }]} {...props}>
      {children}
    </View>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
  variant?: 'default' | 'elevated' | 'gradient';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding = 'md',
  variant = 'default'
}) => {
  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={theme.gradients.card}
        style={[
          styles.card,
          styles.elevated,
          { padding: theme.spacing[padding] },
          style
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[
      styles.card,
      variant === 'elevated' && styles.elevated,
      variant === 'elevated' && Platform.OS !== 'web' && theme.shadows.card,
      { padding: theme.spacing[padding] },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    backgroundColor: theme.colors.cardElevated,
    borderColor: theme.colors.borderLight,
  },
});