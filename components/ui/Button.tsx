import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Animated, Platform } from 'react-native';
import { theme } from '../../theme';

// Conditional import for LinearGradient
let LinearGradient: any;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  // Fallback for web or if expo-linear-gradient is not available
  LinearGradient = ({ children, colors, style, ...props }: any) => (
    <Animated.View style={[style, { backgroundColor: colors[0] }]} {...props}>
      {children}
    </Animated.View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const ButtonContent = () => (
    <>
      {icon && <>{icon}</>}
      <Text style={[styles.text, styles[`${variant}Text`], textStyle, icon && { marginLeft: 8 }]}>
        {title}
      </Text>
    </>
  );

  if (variant === 'gradient') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]} pointerEvents="box-none">
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              styles[size],
              disabled && styles.disabled,
              !disabled && Platform.OS !== 'web' && theme.shadows.glow,
            ]}
          >
            <ButtonContent />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]} pointerEvents="box-none">
      <TouchableOpacity
        style={[
          styles.button,
          styles[variant],
          styles[size],
          disabled && styles.disabled,
          variant === 'primary' && !disabled && theme.shadows.glow,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        <ButtonContent />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gradient: {
    // Handled by LinearGradient
  },
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  ghostText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  gradientText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});