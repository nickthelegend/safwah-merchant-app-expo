import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { AuthContext } from '../../provider/AuthProvider';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useContext(AuthContext);

  const handleLogin = () => {
    // Navigate to onboarding after login
    router.push('/onboarding');
  };

  const navigateToRegister = () => {
    router.push('/(auth)/register');
  };

  const navigateToForgotPassword = () => {
    router.push('/(auth)/forget-password');
  };

  return (
    <LinearGradient colors={theme.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image source={require('../../assets/Irion.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.title}>Welcome to IRION</Text>
            <Text style={styles.subtitle}>Crypto payments made simple</Text>
          </View>

          <Card variant="elevated" style={styles.formCard}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Ionicons name="mail" size={20} color={theme.colors.textMuted} />}
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Ionicons name="lock-closed" size={20} color={theme.colors.textMuted} />}
            />

            <TouchableOpacity style={styles.forgotPassword} onPress={navigateToForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Get Started"
              onPress={handleLogin}
              variant="gradient"
              icon={<Ionicons name="arrow-forward" size={20} color="#000" />}
              style={styles.loginButton}
            />

            <TouchableOpacity style={styles.registerLink} onPress={navigateToRegister}>
              <Text style={styles.registerText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  logoImage: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
    marginTop: -theme.spacing.sm,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  registerLink: {
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
  },
  registerText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});